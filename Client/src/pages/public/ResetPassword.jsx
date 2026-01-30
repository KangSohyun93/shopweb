import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword, forgotPassword } from '../../services/api';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Mã OTP không chính xác hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Mã OTP mới đã được gửi đến email của bạn!');
      setOtp(''); // Clear OTP input
      setResendCooldown(60); // Set cooldown 1 phút cho lần đầu
    } catch (err) {
      if (err.response?.status === 429) {
        const cooldown = err.response.data.cooldown || 60;
        setResendCooldown(cooldown);
        setError(err.response.data.error || `Vui lòng chờ ${cooldown} giây`);
      } else {
        setError(err.response?.data?.error || 'Gửi lại OTP thất bại');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) {
    return (
      <div className="container mx-auto py-8 max-w-md text-center">
        <p className="text-red-500 mb-4">Không tìm thấy email. Vui lòng thử lại.</p>
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Quay lại quên mật khẩu
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Đặt lại mật khẩu</h2>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6 text-center">
          Nhập mã OTP đã được gửi đến: <strong>{email}</strong>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-1 block w-full border rounded p-3 text-center text-2xl tracking-widest focus:ring-blue-500 focus:border-blue-500"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ít nhất 6 ký tự"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Không nhận được mã?</p>
          {resendCooldown > 0 ? (
            <div className="mt-2 text-gray-500">
              Gửi lại sau {formatTime(resendCooldown)}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-blue-600 hover:underline mt-2 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
