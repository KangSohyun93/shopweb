import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess('Mã OTP đã được gửi đến email của bạn!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Email không tồn tại trong hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu</h2>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6 text-center">
          Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="example@gmail.com"
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
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
