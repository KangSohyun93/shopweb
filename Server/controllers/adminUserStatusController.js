const pool = require('../config/db');

const adminUserStatusController = {
  // Lock/Unlock user
  toggleLockUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { is_locked } = req.body;

      if (is_locked === undefined) {
        return res.status(400).json({ error: 'Trường is_locked là bắt buộc' });
      }

      // Check if user exists
      const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      await pool.query('UPDATE users SET is_locked = ? WHERE user_id = ?', [is_locked, userId]);

      res.json({ 
        message: is_locked ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản'
      });
    } catch (error) {
      console.error('Error toggling lock user:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái khoá' });
    }
  },

  // Soft delete user
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      // Check if user exists
      const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      await pool.query(
        'UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE user_id = ?',
        [userId]
      );

      res.json({ message: 'Đã xoá người dùng' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Lỗi khi xoá người dùng' });
    }
  },

  // Restore deleted user
  restoreUser: async (req, res) => {
    try {
      const { userId } = req.params;

      await pool.query(
        'UPDATE users SET is_deleted = FALSE, deleted_at = NULL WHERE user_id = ?',
        [userId]
      );

      res.json({ message: 'Đã khôi phục người dùng' });
    } catch (error) {
      console.error('Error restoring user:', error);
      res.status(500).json({ error: 'Lỗi khi khôi phục người dùng' });
    }
  }
};

module.exports = adminUserStatusController;
