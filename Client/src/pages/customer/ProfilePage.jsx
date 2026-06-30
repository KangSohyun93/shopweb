import { useState, useEffect } from 'react';
import { getMyProfile, updateProfile, changePassword, getAddresses, createAddress, deleteAddress } from '../../services/api';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Profile data
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    
    // Password data
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Addresses
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        recipient_name: '',
        phone: '',
        street: '',
        city: '',
        country: 'Vietnam',
        is_default: false
    });

    // Clear error/success khi chuyển tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError('');
        setSuccess('');
    };

    // Auto-clear success/error sau 5 giây
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    useEffect(() => {
        fetchProfile();
        fetchAddresses();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(''); // Clear error trước khi fetch
            const response = await getMyProfile();
            setProfile(response.data);
        } catch (err) {
            setError('Không thể tải thông tin profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await getAddresses();
            setAddresses(response.data || []);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            // Không set error ở đây để tránh ghi đè error từ fetchProfile
        }
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        console.log('🔄 Starting profile update...');
        
        // Clear messages IMMEDIATELY
        setError('');
        setSuccess('');
        
        // Small delay to ensure state is cleared
        await new Promise(resolve => setTimeout(resolve, 10));
        
        try {
            console.log('📤 Sending update request with data:', {
                username: profile.username,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone
            });
            
            const response = await updateProfile({
                username: profile.username,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone
            });
            
            console.log('✅ Update successful, response:', response);
            setSuccess('Cập nhật thông tin thành công!');
            
            // Cập nhật localStorage với dữ liệu mới từ server
            try {
                const userStr = localStorage.getItem('user');
                if (userStr && response.data?.user) {
                    const currentUser = JSON.parse(userStr);
                    const updatedUser = {
                        ...currentUser,
                        ...response.data.user // Merge dữ liệu mới từ server
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    console.log('📝 LocalStorage updated:', updatedUser);
                }
            } catch (localStorageErr) {
                console.warn('⚠️ Failed to update localStorage:', localStorageErr);
                // Không throw error, vì update đã thành công
            }
        } catch (err) {
            console.error('❌ Update failed:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.error || 'Cập nhật thất bại');
        }
    };

    const handleKeyDown = (e, nextFieldName) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextFieldName) {
                const nextField = document.getElementsByName(nextFieldName)[0];
                if (nextField) {
                    nextField.focus();
                }
            }
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        
        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Đổi mật khẩu thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Đổi mật khẩu thất bại');
        }
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress({
            ...newAddress,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            await createAddress(newAddress);
            setSuccess('Thêm địa chỉ thành công!');
            setShowAddressForm(false);
            setNewAddress({
                recipient_name: '',
                phone: '',
                street: '',
                city: '',
                country: 'Vietnam',
                is_default: false
            });
            fetchAddresses();
        } catch (err) {
            setError(err.response?.data?.error || 'Thêm địa chỉ thất bại');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
        
        try {
            await deleteAddress(addressId);
            setSuccess('Xóa địa chỉ thành công!');
            fetchAddresses();
        } catch (err) {
            setError(err.response?.data?.error || 'Xóa địa chỉ thất bại');
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải...</div>;

    return (
        <div className="container mx-auto py-6 md:py-8 px-4 mt-14 md:mt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Tài khoản của tôi</h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

            {/* Tabs */}
            <div className="flex gap-2 md:gap-4 mb-6 border-b overflow-x-auto whitespace-nowrap scrollbar-none">
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`px-4 md:px-6 py-3 font-semibold text-sm md:text-base ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Thông tin cá nhân
                </button>
                <button
                    onClick={() => handleTabChange('password')}
                    className={`px-4 md:px-6 py-3 font-semibold text-sm md:text-base ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Đổi mật khẩu
                </button>
                <button
                    onClick={() => handleTabChange('addresses')}
                    className={`px-4 md:px-6 py-3 font-semibold text-sm md:text-base ${activeTab === 'addresses' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                >
                    Địa chỉ giao hàng
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                    <h3 className="text-xl font-semibold mb-4">Thông tin cá nhân</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Email (không thể thay đổi)</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={profile.username}
                                onChange={handleProfileChange}
                                onKeyDown={(e) => handleKeyDown(e, 'first_name')}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Họ</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={profile.first_name || ''}
                                    onChange={handleProfileChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'last_name')}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Tên</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={profile.last_name || ''}
                                    onChange={handleProfileChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'phone')}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone || ''}
                                onChange={handleProfileChange}
                                className="w-full px-4 py-2 border rounded"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Cập nhật thông tin
                        </button>
                    </form>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                    <h3 className="text-xl font-semibold mb-4">Đổi mật khẩu</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Đổi mật khẩu
                        </button>
                    </form>
                </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Địa chỉ giao hàng</h3>
                        <button
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            {showAddressForm ? 'Hủy' : '+ Thêm địa chỉ mới'}
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddAddress} className="mb-6 p-4 border rounded bg-gray-50">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Người nhận</label>
                                    <input
                                        type="text"
                                        name="recipient_name"
                                        value={newAddress.recipient_name}
                                        onChange={handleAddressChange}
                                        className="w-full px-4 py-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newAddress.phone}
                                        onChange={handleAddressChange}
                                        className="w-full px-4 py-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Địa chỉ</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={newAddress.street}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Thành phố</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={newAddress.city}
                                    onChange={handleAddressChange}
                                    className="w-full px-4 py-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        checked={newAddress.is_default}
                                        onChange={handleAddressChange}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-700">Đặt làm địa chỉ mặc định</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                            >
                                Lưu địa chỉ
                            </button>
                        </form>
                    )}

                    <div className="space-y-4">
                        {addresses.length === 0 ? (
                            <p className="text-gray-500">Chưa có địa chỉ nào</p>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr.address_id} className="border p-4 rounded flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{addr.recipient_name}</p>
                                        <p className="text-gray-600">{addr.phone}</p>
                                        <p className="text-gray-600">{addr.street}, {addr.city}, {addr.country}</p>
                                        {addr.is_default && (
                                            <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                                                Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAddress(addr.address_id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
