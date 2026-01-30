const Brand = require('../models/brand');

const brandController = {
    // Lấy tất cả thương hiệu
    getBrands: async (req, res) => {
        try {
            const brands = await Brand.getAll();
            res.json(brands);
        } catch (error) {
            console.error('Error fetching brands:', error);
            res.status(500).json({ error: 'Failed to fetch brands' });
        }
    },

    // Lấy thương hiệu theo ID
    getBrandById: async (req, res) => {
        try {
            const brand = await Brand.getById(req.params.id);
            if (!brand) {
                return res.status(404).json({ error: 'Brand not found' });
            }
            res.json(brand);
        } catch (error) {
            console.error('Error fetching brand:', error);
            res.status(500).json({ error: 'Failed to fetch brand' });
        }
    },

    // Thêm thương hiệu
    createBrand: async (req, res) => {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' });
            }
            const brandId = await Brand.create({ name, description });
            res.status(201).json({ id: brandId, message: 'Brand created successfully' });
        } catch (error) {
            console.error('Error creating brand:', error);
            res.status(500).json({ error: 'Failed to create brand' });
        }
    },

    // Sửa thương hiệu
    updateBrand: async (req, res) => {
        try {
            const { brand_id } = req.params;
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' });
            }
            await Brand.update(brand_id, { name, description });
            res.json({ message: 'Brand updated successfully' });
        } catch (error) {
            console.error('Error updating brand:', error);
            res.status(500).json({ error: 'Failed to update brand' });
        }
    },

    // Xóa thương hiệu
    deleteBrand: async (req, res) => {
        try {
            const { brand_id } = req.params;
            const productCount = await Brand.checkProducts(brand_id);
            if (productCount > 0) {
                return res.status(400).json({ error: 'Cannot delete brand with associated products' });
            }
            await Brand.delete(brand_id);
            res.json({ message: 'Brand deleted successfully' });
        } catch (error) {
            console.error('Error deleting brand:', error);
            res.status(500).json({ error: 'Failed to delete brand' });
        }
    }
};

module.exports = brandController;