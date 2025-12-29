const Banner = require('../models/banner');

// Lấy tất cả banner (admin)
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.getAll();
        res.json(banners);
    } catch (error) {
        console.error('Error fetching all banners:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách banner' });
    }
};

// Lấy banner active (public)
exports.getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.getActive();
        res.json(banners);
    } catch (error) {
        console.error('Error fetching active banners:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách banner' });
    }
};

// Lấy banner theo ID
exports.getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.getById(id);
        
        if (!banner) {
            return res.status(404).json({ error: 'Không tìm thấy banner' });
        }
        
        res.json(banner);
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin banner' });
    }
};

// Tạo banner mới (admin)
exports.createBanner = async (req, res) => {
    try {
        const { title, description, image_url, link_url, is_active, start_date, end_date, display_order } = req.body;

        if (!title || !image_url) {
            return res.status(400).json({ error: 'Tiêu đề và hình ảnh là bắt buộc' });
        }

        const bannerId = await Banner.create({
            title,
            description,
            image_url,
            link_url,
            is_active,
            start_date,
            end_date,
            display_order
        });

        const newBanner = await Banner.getById(bannerId);
        res.status(201).json(newBanner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ error: 'Lỗi khi tạo banner' });
    }
};

// Cập nhật banner (admin)
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, link_url, is_active, start_date, end_date, display_order } = req.body;

        const banner = await Banner.getById(id);
        if (!banner) {
            return res.status(404).json({ error: 'Không tìm thấy banner' });
        }

        if (!title || !image_url) {
            return res.status(400).json({ error: 'Tiêu đề và hình ảnh là bắt buộc' });
        }

        const updated = await Banner.update(id, {
            title,
            description,
            image_url,
            link_url,
            is_active,
            start_date,
            end_date,
            display_order
        });

        if (!updated) {
            return res.status(500).json({ error: 'Không thể cập nhật banner' });
        }

        const updatedBanner = await Banner.getById(id);
        res.json(updatedBanner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật banner' });
    }
};

// Xóa banner (admin)
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.getById(id);
        if (!banner) {
            return res.status(404).json({ error: 'Không tìm thấy banner' });
        }

        const deleted = await Banner.delete(id);
        if (!deleted) {
            return res.status(500).json({ error: 'Không thể xóa banner' });
        }

        res.json({ message: 'Xóa banner thành công' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ error: 'Lỗi khi xóa banner' });
    }
};

// Cập nhật trạng thái banner (admin)
exports.updateBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({ error: 'Trạng thái is_active là bắt buộc' });
        }

        const banner = await Banner.getById(id);
        if (!banner) {
            return res.status(404).json({ error: 'Không tìm thấy banner' });
        }

        await Banner.updateStatus(id, is_active);
        const updatedBanner = await Banner.getById(id);
        
        res.json(updatedBanner);
    } catch (error) {
        console.error('Error updating banner status:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái banner' });
    }
};
