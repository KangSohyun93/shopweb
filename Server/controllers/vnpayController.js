const crypto = require('crypto');
const db = require('../config/db');

// ─── Hàm tiện ích ──────────────────────────────────────────────────────────

/**
 * Sắp xếp object theo key và encode thành query string (chuẩn VNPay)
 */
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => { sorted[key] = obj[key]; });
    return sorted;
}

/**
 * Tạo chữ ký HMAC-SHA512 theo chuẩn VNPay
 */
function createSignature(data, secretKey) {
    const signData = Object.entries(data)
        .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
        .join('&');
    return crypto.createHmac('sha512', secretKey).update(signData).digest('hex');
}

/**
 * Verify chữ ký từ VNPay gọi về
 */
function verifySignature(params, secretKey) {
    const secureHash = params['vnp_SecureHash'];
    const signParams = { ...params };
    delete signParams['vnp_SecureHash'];
    delete signParams['vnp_SecureHashType'];

    const sorted = sortObject(signParams);
    const expectedHash = createSignature(sorted, secretKey);
    return secureHash === expectedHash;
}

// ─── API 1: Tạo URL thanh toán VNPay ──────────────────────────────────────
// POST /api/vnpay/create-payment
// Body: { order_id, amount }
exports.createPaymentUrl = async (req, res) => {
    try {
        const { order_id, amount } = req.body;

        if (!order_id || !amount) {
            return res.status(400).json({ success: false, message: 'Thiếu order_id hoặc amount' });
        }

        const tmnCode    = process.env.VNPAY_TMN_CODE;
        const secretKey  = process.env.VNPAY_HASH_SECRET;
        const vnpUrl     = process.env.VNPAY_URL;
        const returnUrl  = process.env.VNPAY_BACKEND_RETURN_URL || 'http://localhost:5000/api/vnpay/return';

        const date = new Date();
        // Format: YYYYMMDDHHmmss (múi giờ +07:00)
        const pad = n => String(n).padStart(2, '0');
        const createDate = `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

        // VNPay yêu cầu amount tính bằng đồng VND × 100
        // Vì hệ thống dùng USD (decimal), ta convert tạm: 1$ = 25000 VND
        const amountVND = Math.round(parseFloat(amount) * 25000);

        const vnpParams = sortObject({
            vnp_Version:    '2.1.0',
            vnp_Command:    'pay',
            vnp_TmnCode:    tmnCode,
            vnp_Locale:     'vn',
            vnp_CurrCode:   'VND',
            vnp_TxnRef:     `${order_id}_${Date.now()}`,   // mã giao dịch duy nhất
            vnp_OrderInfo:  `Thanh toan don hang ${order_id}`,
            vnp_OrderType:  'other',
            vnp_Amount:     amountVND * 100,               // × 100 theo quy định VNPay
            vnp_ReturnUrl:  returnUrl,
            vnp_IpAddr:     req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
            vnp_CreateDate: createDate,
        });

        // Ký
        const secureHash = createSignature(vnpParams, secretKey);

        // Build URL cuối
        const queryString = Object.entries(vnpParams)
            .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
            .join('&');

        const paymentUrl = `${vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;

        // Ghi record vào bảng payments (status = pending)
        await db.query(
            `INSERT INTO payments (order_id, amount, method, status, transaction_id)
             VALUES (?, ?, 'vnpay', 'pending', ?)`,
            [order_id, parseFloat(amount), vnpParams.vnp_TxnRef]
        );

        return res.json({ success: true, paymentUrl });
    } catch (err) {
        console.error('❌ Lỗi createPaymentUrl:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo URL thanh toán' });
    }
};

// ─── API 2: Return URL — VNPay redirect user về sau khi thanh toán ─────────
// GET /api/vnpay/return
exports.vnpayReturn = async (req, res) => {
    try {
        const params = { ...req.query };
        const secretKey = process.env.VNPAY_HASH_SECRET;

        const isValid = verifySignature(params, secretKey);
        const responseCode = params['vnp_ResponseCode'];
        const txnRef = params['vnp_TxnRef'];   // format: "orderId_timestamp"
        const orderId = parseInt(txnRef?.split('_')[0]);

        if (isValid && responseCode === '00') {
            // Cập nhật payments → completed
            await db.query(
                `UPDATE payments SET status = 'completed', updated_at = NOW()
                 WHERE transaction_id = ? AND method = 'vnpay'`,
                [txnRef]
            );
            // Cập nhật orders → processing
            if (orderId) {
                await db.query(
                    `UPDATE orders SET status = 'processing' WHERE order_id = ?`,
                    [orderId]
                );
            }
        } else if (isValid) {
            // Thanh toán thất bại — cập nhật status failed
            await db.query(
                `UPDATE payments SET status = 'failed', updated_at = NOW()
                 WHERE transaction_id = ? AND method = 'vnpay'`,
                [txnRef]
            );
        }

        // Forward toàn bộ params về client để hiển thị kết quả
        const clientUrl = `${process.env.VNPAY_RETURN_URL}?` +
            Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

        return res.redirect(clientUrl);
    } catch (err) {
        console.error('❌ Lỗi vnpayReturn:', err);
        return res.redirect(`${process.env.VNPAY_RETURN_URL}?error=server`);
    }
};

// ─── API 3: IPN — VNPay gọi server-to-server (khi có IP public) ────────────
// GET /api/vnpay/ipn
exports.vnpayIPN = async (req, res) => {
    try {
        const params = { ...req.query };
        const secretKey = process.env.VNPAY_HASH_SECRET;

        const isValid = verifySignature(params, secretKey);
        if (!isValid) {
            return res.json({ RspCode: '97', Message: 'Invalid signature' });
        }

        const responseCode = params['vnp_ResponseCode'];
        const txnRef = params['vnp_TxnRef'];
        const orderId = parseInt(txnRef?.split('_')[0]);

        // Kiểm tra đơn hàng tồn tại
        const [orders] = await db.query('SELECT order_id FROM orders WHERE order_id = ?', [orderId]);
        if (!orders.length) {
            return res.json({ RspCode: '01', Message: 'Order not found' });
        }

        // Kiểm tra đã xử lý chưa (tránh duplicate)
        const [payments] = await db.query(
            `SELECT status FROM payments WHERE transaction_id = ? AND method = 'vnpay'`,
            [txnRef]
        );
        if (payments.length && payments[0].status === 'completed') {
            return res.json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (responseCode === '00') {
            await db.query(
                `UPDATE payments SET status = 'completed', updated_at = NOW()
                 WHERE transaction_id = ? AND method = 'vnpay'`,
                [txnRef]
            );
            await db.query(
                `UPDATE orders SET status = 'processing' WHERE order_id = ?`,
                [orderId]
            );
            return res.json({ RspCode: '00', Message: 'Success' });
        } else {
            await db.query(
                `UPDATE payments SET status = 'failed', updated_at = NOW()
                 WHERE transaction_id = ? AND method = 'vnpay'`,
                [txnRef]
            );
            return res.json({ RspCode: '00', Message: 'Failure recorded' });
        }
    } catch (err) {
        console.error('❌ Lỗi vnpayIPN:', err);
        return res.json({ RspCode: '99', Message: 'Server error' });
    }
};
