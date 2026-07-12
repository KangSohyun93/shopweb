const db = require('../config/db');
const { exec } = require('child_process');
const path = require('path');

let isWorkerRunning = false;

// GET /api/ai-rules/settings
exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.query('SELECT setting_key, setting_value, description FROM ai_settings');
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error('Lỗi khi lấy cấu hình:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy cấu hình' });
    }
};

// Validate dynamic values
const validateSetting = (key, value) => {
    if (key === 'active_algorithm') {
        return ['fpgrowth',
            'apriori' ,
            'dic_apriori',
            'hash_apriori', 
            'partition_apriori',
            'sampling_apriori',
            'transaction_reduction'
         ].includes(value);
    }
    if (key === 'recommendation_method') {
        return ['hybrid', 'trending'].includes(value);
    }
    const boolKeys = [
        'new_arrivals_boost_enabled',
        'homepage_use_cart_redis',
        'homepage_use_trending',
        'product_use_item_redis',
        'product_use_cart_redis',
        'product_use_category_jaccard',
        'product_use_trending',
        'cart_use_redis',
        'cart_use_trending',
    ];
    if (boolKeys.includes(key)) {
        return ['true', 'false'].includes(value);
    }
    if (key === 'last_mining_stats') {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Numeric settings
    const numValue = Number(value);
    if (isNaN(numValue)) return false;

    // Integer >= 0
    const intNonNeg = [
        'blend_relevant_count', 'blend_trending_count',
        'min_support_count', 'max_recs_per_product',
        'trending_limit', 'top_categories_limit',
        'homepage_blend_relevant_count', 'homepage_blend_trending_count',
        'product_blend_relevant_count',  'product_blend_trending_count',
        'cart_blend_relevant_count',     'cart_blend_trending_count',
    ];
    if (intNonNeg.includes(key)) {
        return Number.isInteger(numValue) && numValue >= 0;
    }
    if (['new_arrivals_interval', 'new_arrivals_days'].includes(key)) {
        return Number.isInteger(numValue) && numValue >= 1;
    }
    if (['jaccard_weight', 'sales_weight', 'min_confidence'].includes(key)) {
        return numValue >= 0 && numValue <= 1;
    }

    return false;
};

exports.updateSetting = async (req, res) => {
    const { settings, setting_key, setting_value } = req.body;
    
    // Hỗ trợ cập nhật hàng loạt (batch update) hoặc đơn lẻ
    let updates = [];
    if (settings && Array.isArray(settings)) {
        updates = settings;
    } else if (setting_key !== undefined && setting_value !== undefined) {
        updates = [{ setting_key, setting_value }];
    } else {
        return res.status(400).json({ success: false, message: 'Thiếu key hoặc value cấu hình' });
    }

    // Validate tất cả cấu hình gửi lên
    for (const update of updates) {
        const { setting_key: key, setting_value: val } = update;
        if (!key || val === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin cấu hình' });
        }
        if (!validateSetting(key, val)) {
            return res.status(400).json({ success: false, message: `Giá trị cấu hình không hợp lệ cho khóa: ${key}` });
        }
    }

    try {
        for (const update of updates) {
            const { setting_key: key, setting_value: val } = update;
            await db.query(
                'UPDATE ai_settings SET setting_value = ? WHERE setting_key = ?',
                [String(val), key]
            );
        }
        res.status(200).json({ success: true, message: 'Cập nhật cấu hình thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật cấu hình:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật cấu hình' });
    }
};

// POST /api/ai-rules/run-worker
exports.runMiningWorker = async (req, res) => {
    if (isWorkerRunning) {
        return res.status(400).json({ 
            success: false, 
            message: 'Tiến trình tính toán hiện đang chạy, vui lòng đợi cho đến khi hoàn thành.' 
        });
    }

    isWorkerRunning = true;
    
    // Paths
    const workerDir = path.join(__dirname, '..', '..', 'worker');
    const pythonExe = path.join(workerDir, 'venv', 'Scripts', 'python.exe');
    const scriptPath = path.join(workerDir, 'main.py');
    const command = `"${pythonExe}" "${scriptPath}"`;

    console.log(`🚀 Bắt đầu kích hoạt Python worker: ${command}`);

    // Trả về phản hồi cho client ngay lập tức để không bị timeout (do chạy nền)
    res.status(200).json({ 
        success: true, 
        message: 'Đã kích hoạt chạy thuật toán ngầm thành công. Dữ liệu sẽ được cập nhật trong ít phút.' 
    });

    exec(command, { 
        cwd: workerDir, 
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' } 
    }, (error, stdout, stderr) => {
        isWorkerRunning = false;
        if (error) {
            console.error('❌ Lỗi khi thực thi Python worker:', error);
            console.error('Stderr:', stderr);
            return;
        }
        console.log('✅ Python worker đã chạy hoàn thành.');
        console.log('Output:', stdout);
    });
};

// GET /api/ai-rules/benchmark-logs
exports.getBenchmarkLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const [logs] = await db.query(
            'SELECT id, algorithm, runtime, num_frequent_itemsets, num_rules, min_support_count, min_confidence, num_transactions, created_at FROM benchmark_logs ORDER BY created_at DESC LIMIT ?',
            [limit]
        );
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Lỗi khi lấy benchmark logs:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử benchmark' });
    }
};
