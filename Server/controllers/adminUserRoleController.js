const pool = require('../config/db');

const adminUserRoleController = {
  // Change user role
  changeUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['customer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role phải là customer hoặc admin' });
      }

      // Check if user exists
      const [users] = await pool.query('SELECT user_id, role FROM users WHERE user_id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, userId]);

      res.json({ message: 'Cập nhật vai trò thành công' });
    } catch (error) {
      console.error('Error changing role:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật vai trò' });
    }
  }
};

module.exports = adminUserRoleController;
