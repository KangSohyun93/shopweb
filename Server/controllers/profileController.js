const User = require('../models/user');
const bcrypt = require('bcrypt');

const profileController = {
  // Lấy tất cả người dùng
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Lấy người dùng theo ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Lấy thông tin profile của user hiện tại
  getMyProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Loại bỏ password_hash trước khi trả về
      const { password_hash, otp_code, otp_expires, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // Cập nhật thông tin profile
  updateProfile: async (req, res) => {
    try {
      const { username, first_name, last_name, phone } = req.body;
      const userId = req.user.user_id;

      const success = await User.updateProfile(userId, { username, first_name, last_name, phone });
      if (!success) {
        return res.status(400).json({ error: 'Failed to update profile' });
      }

      const updatedUser = await User.findById(userId);
      const { password_hash, otp_code, otp_expires, ...userProfile } = updatedUser;
      
      res.json({ message: 'Profile updated successfully', user: userProfile });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  // Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.user_id;

      const user = await User.findById(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isMatch) {
        return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const success = await User.changePassword(userId, hashedPassword);
      
      if (!success) {
        return res.status(400).json({ error: 'Failed to change password' });
      }

      res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
};

module.exports = profileController;
