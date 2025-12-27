const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
require('dotenv').config();

const userController = {
    // Đăng ký người dùng
    register: async (req, res) => {
        try {
            const { username, email, password, first_name, last_name, phone } = req.body;

            console.log('📝 Bắt đầu đăng ký cho email:', email);

            const existingUser = await User.findByEmail(email);
            if (existingUser) return res.status(400).json({ error: 'Email already exists' });

            // 1. Tạo OTP ngẫu nhiên 6 chữ số
            const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
            // Lấy giờ địa phương Việt Nam
            const now = new Date();
            const expiresDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 phút sau
            const otp_expires = expiresDate.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace('T', ' ');

            console.log('🔑 OTP được tạo:', otp_code);
            console.log('⏰ Thời gian hết hạn (Local VN):', otp_expires);

            // 2. Lưu user vào DB với trạng thái is_verified = FALSE
            const userId = await User.create({
                username, email, password, first_name, last_name, phone, otp_code, otp_expires
            });

            console.log('✅ User đã được tạo với ID:', userId);

            // 3. Gửi Email chứa OTP (bất đồng bộ - không đợi)
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Xác nhận tài khoản - Mã OTP',
                text: `Mã OTP của bạn là: ${otp_code}. Mã này sẽ hết hạn trong 10 phút.`
            }).then(() => {
                console.log('📧 Email OTP đã được gửi đến:', email);
            }).catch(err => {
                console.error('❌ Lỗi gửi email:', err);
            });

            // Trả response ngay lập tức (không đợi email)
            res.status(201).json({ message: 'OTP đã được gửi về email của bạn.' });
        } catch (error) {
            console.error('❌ LỖI ĐĂNG KÝ:', error);
            res.status(500).json({ error: 'Đăng ký thất bại', details: error.message });
        }
    },

    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            console.log('🔍 Xác thực OTP cho email:', email, '| OTP nhập:', otp);
            
            const user = await User.findByEmail(email);

            if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });
            if (user.is_verified) return res.status(400).json({ error: 'Tài khoản đã được xác minh' });

            console.log('🔑 OTP trong DB:', user.otp_code);
            console.log('⏰ Hết hạn (raw):', user.otp_expires);

            // Kiểm tra mã OTP
            if (user.otp_code !== otp) {
                return res.status(400).json({ error: 'Mã OTP không đúng' });
            }

            // Kiểm tra thời gian hết hạn
            const now = new Date();
            // user.otp_expires là string '2025-12-27 14:11:39' (giờ VN)
            // Parse thủ công để tránh JS hiểu sai múi giờ
            const [datePart, timePart] = user.otp_expires.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            
            // Tạo Date object với múi giờ VN (UTC+7)
            const expiryDate = new Date(year, month - 1, day, hour, minute, second);
            
            console.log('🕐 Thời gian hiện tại:', now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
            console.log('⏰ Thời gian hết hạn:', expiryDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
            console.log('🕢 So sánh timestamp:', now.getTime(), '>', expiryDate.getTime(), '=', now.getTime() > expiryDate.getTime());

            if (now.getTime() > expiryDate.getTime()) {
                return res.status(400).json({ error: 'Mã OTP đã hết hạn' });
            }

            // Cập nhật trạng thái xác minh
            await User.verifyUser(email);
            console.log('✅ Xác thực thành công cho:', email);
            res.json({ message: 'Xác minh tài khoản thành công! Bạn có thể đăng nhập.' });
        } catch (error) {
            console.error('❌ LỖI XÁC THỰC:', error);
            res.status(500).json({ error: 'Xác minh thất bại', details: error.message });
        }
    },

    // Gửi lại OTP với cooldown: 1p -> 3p -> 10p
    resendOTP: async (req, res) => {
        try {
            const { email } = req.body;
            console.log('🔄 Yêu cầu gửi lại OTP cho:', email);

            const user = await User.findByEmail(email);
            if (!user) return res.status(404).json({ error: 'Email không tồn tại' });
            if (user.is_verified) return res.status(400).json({ error: 'Tài khoản đã được xác minh' });

            // Kiểm tra cooldown
            const resendCount = user.otp_resend_count || 0;
            const lastSent = user.otp_last_sent ? new Date(user.otp_last_sent) : null;
            
            // Xác định thời gian chờ (1p, 3p, 10p)
            const cooldownTimes = [60, 180, 600]; // giây
            const cooldownSeconds = cooldownTimes[Math.min(resendCount, cooldownTimes.length - 1)];
            
            if (lastSent) {
                const secondsSinceLastSent = Math.floor((Date.now() - lastSent.getTime()) / 1000);
                const remainingCooldown = cooldownSeconds - secondsSinceLastSent;
                
                if (remainingCooldown > 0) {
                    return res.status(429).json({ 
                        error: `Vui lòng chờ ${Math.ceil(remainingCooldown)} giây trước khi gửi lại`,
                        cooldown: remainingCooldown
                    });
                }
            }

            // Tạo OTP mới
            const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
            const now = new Date();
            const expiresDate = new Date(now.getTime() + 10 * 60 * 1000);
            const otp_expires = expiresDate.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace('T', ' ');

            console.log('🔑 OTP mới:', otp_code);
            console.log('🔢 Số lần gửi:', resendCount + 1);

            // Cập nhật OTP và số lần gửi
            await User.updateOTPWithResendCount(email, otp_code, otp_expires, resendCount + 1);

            // Gửi email (bất đồng bộ - không đợi)
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Mã OTP mới - Xác nhận tài khoản',
                text: `Mã OTP mới của bạn là: ${otp_code}. Mã này sẽ hết hạn trong 10 phút.`
            }).then(() => {
                console.log('✅ OTP đã được gửi lại');
            }).catch(err => {
                console.error('❌ Lỗi gửi email:', err);
            });

            // Trả về thời gian chờ tiếp theo (ngay lập tức)
            const nextCooldown = cooldownTimes[Math.min(resendCount + 1, cooldownTimes.length - 1)];
            res.json({ 
                message: 'OTP mới đã được gửi',
                nextCooldown: nextCooldown
            });
        } catch (error) {
            console.error('❌ LỖI GỬI LẠI OTP:', error);
            res.status(500).json({ error: 'Gửi lại OTP thất bại', details: error.message });
        }
    },

    // Đăng nhập
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Tìm người dùng
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Tạo JWT
            const token = jwt.sign(
                { user_id: user.user_id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Token hết hạn sau 1 giờ
            );

            res.json({
                message: 'Login successful',
                user: { id: user.user_id, username: user.username, email: user.email, role: user.role },
                token
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to login' });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            console.log('🔐 Yêu cầu quên mật khẩu cho:', email);
            
            const user = await User.findByEmail(email);
            if (!user) return res.status(404).json({ error: 'Email không tồn tại' });

            // Tạo OTP 6 số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Lấy giờ địa phương Việt Nam
            const now = new Date();
            const expiresDate = new Date(now.getTime() + 10 * 60 * 1000);
            const expires = expiresDate.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).replace('T', ' ');

            console.log('🔑 OTP quên mật khẩu:', otp);
            console.log('⏰ Hết hạn:', expires);

            // Lưu OTP vào DB
            await User.updateOTP(user.user_id, otp, expires);
            console.log('✅ OTP đã được cập nhật vào DB');

            // Gửi mail (bất đồng bộ)
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Mã OTP đặt lại mật khẩu',
                text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`
            }).then(() => {
                console.log('📧 Email đã gửi đến:', email);
            }).catch(err => {
                console.error('❌ Lỗi gửi email:', err);
            });

            res.json({ message: 'Mã OTP đã được gửi vào email của bạn' });
        } catch (error) {
            console.error('❌ LỖI QUÊN MẬT KHẨU:', error);
            res.status(500).json({ error: 'Lỗi gửi mail', details: error.message });
        }
    },

    // 2. Đặt lại mật khẩu mới
    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            // Kiểm tra OTP
            if (user.otp_code !== otp) {
                return res.status(400).json({ error: 'Mã OTP không đúng' });
            }

            // Kiểm tra thời gian hết hạn
            const now = new Date();
            // Parse thủ công để tránh JS hiểu sai múi giờ
            const [datePart, timePart] = user.otp_expires.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
            const expiryDate = new Date(year, month - 1, day, hour, minute, second);
            
            if (now.getTime() > expiryDate.getTime()) {
                return res.status(400).json({ error: 'Mã OTP đã hết hạn' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            // Cập nhật pass và xóa OTP
            await User.updatePassword(user.user_id, hashedPassword);

            res.json({ message: 'Mật khẩu đã được thay đổi thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi cập nhật mật khẩu' });
        }
    },

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

            // Lấy lại thông tin đã cập nhật
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

            // Kiểm tra mật khẩu hiện tại
            const user = await User.findById(userId);
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            
            if (!isMatch) {
                return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
            }

            // Hash mật khẩu mới
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

module.exports = userController;