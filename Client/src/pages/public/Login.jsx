import { useState } from 'react';
import { login } from './../../services/api'; // Ensure this path is correct based on your project structure
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy đường dẫn trước đó nếu có, để quay lại sau khi đăng nhập
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(email, password);
      const token = response.data.token;
      localStorage.setItem('token', token);

      // --- LOGIC CHUYỂN HƯỚNG THEO VAI TRÒ ---
      const decodedToken = jwtDecode(token);
      if (decodedToken.role === 'admin') {
        // Nếu là admin, chuyển đến trang Dashboard
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Nếu là customer, quay lại trang trước đó hoặc về trang chủ
        navigate(from, { replace: true });
      }
      // --- KẾT THÚC LOGIC CHUYỂN HƯỚNG ---

    } catch (err) {
      setError('Email hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đăng nhập
        </button>
      </form>
      <p className="mt-4 text-center">
        Chưa có tài khoản?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;