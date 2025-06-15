const Category = require('../models/category');

const categoryController = {
    // Lấy tất cả danh mục
    getCategories: async (req, res) => {
        try {
            const categories = await Category.getAll();
            res.json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    },

    // Lấy danh mục theo ID
    getCategoryById: async (req, res) => {
        try {
            const category = await Category.getById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json(category);
        } catch (error) {
            console.error('Error fetching category:', error);
            res.status(500).json({ error: 'Failed to fetch category' });
        }
    },

    // Thêm danh mục
    createCategory: async (req, res) => {
        try {
            const { name, description, parent_id } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' });
            }
            const categoryId = await Category.create({ name, description, parent_id });
            res.status(201).json({ id: categoryId, message: 'Category created successfully' });
        } catch (error) {
            console.error('Error creating category:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    // Sửa danh mục
    updateCategory: async (req, res) => {
        try {
            const { category_id } = req.params;
            const { name, description, parent_id } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Missing required field: name' });
            }
            await Category.update(category_id, { name, description, parent_id });
            res.json({ message: 'Category updated successfully' });
        } catch (error) {
            console.error('Error updating category:', error.message);
            res.status(400).json({ error: error.message });
        }
    },

    // Xóa danh mục
    deleteCategory: async (req, res) => {
        try {
            const { category_id } = req.params;
            await Category.delete(category_id);
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error.message);
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = categoryController;