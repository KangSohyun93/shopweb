import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VNPayReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [details, setDetails] = useState({});

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const amount = searchParams.get('vnp_Amount');
        const txnRef = searchParams.get('vnp_TxnRef');
        const orderInfo = searchParams.get('vnp_OrderInfo');
        const payDate = searchParams.get('vnp_PayDate');

        const orderId = txnRef ? txnRef.split('_')[0] : '';
        const realAmount = amount ? parseFloat(amount) / 100 / 25000 : 0; // Convert back to USD

        setDetails({
            orderId,
            amountUSD: realAmount,
            payDate: payDate ? `${payDate.substring(6, 8)}/${payDate.substring(4, 6)}/${payDate.substring(0, 4)} ${payDate.substring(8, 10)}:${payDate.substring(10, 12)}` : '',
            orderInfo: orderInfo || 'Thanh toán đơn hàng'
        });

        if (responseCode === '00') {
            setStatus('success');
        } else {
            setStatus('failed');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center transition-all hover:shadow-2xl">
                {status === 'success' ? (
                    <div>
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-500 mb-6">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.</p>

                        {/* Order details card */}
                        <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-3 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-semibold text-gray-900">#{details.orderId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Số tiền:</span>
                                <span className="font-bold text-red-600">{(details.amountUSD || 0).toFixed(2)} $</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Thời gian:</span>
                                <span className="font-semibold text-gray-900">{details.payDate}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Nội dung:</span>
                                <span className="text-gray-600 truncate max-w-[200px]">{details.orderInfo}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                            >
                                Xem đơn hàng của tôi
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Error Icon */}
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thất bại</h2>
                        <p className="text-gray-500 mb-6">Giao dịch không thành công hoặc đã bị hủy bỏ.</p>

                        {/* Order details card */}
                        <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-3 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mã đơn hàng:</span>
                                <span className="font-semibold text-gray-900">#{details.orderId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Lưu ý:</span>
                                <span className="text-gray-600">Đơn hàng đã được tạo và lưu ở trạng thái chờ thanh toán. Bạn có thể thanh toán lại.</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-200"
                            >
                                Xem danh sách đơn hàng
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VNPayReturnPage;
