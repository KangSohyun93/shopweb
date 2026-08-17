import { useState, useEffect } from 'react';
import { getAllBanners, createBanner, updateBanner, updateBannerStatus, deleteBanner, uploadBannerImage } from '../../services/api';

const AdminBannersPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        is_active: true,
        start_date: '',
        end_date: '',
        display_order: 0
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await getAllBanners();
            setBanners(response.data);
        } catch (err) {
            console.error('Error fetching banners:', err);
            setError('Không thể tải danh sách banner');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                description: banner.description || '',
                image_url: banner.image_url,
                link_url: banner.link_url || '',
                is_active: banner.is_active,
                start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
                end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
                display_order: banner.display_order || 0
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                description: '',
                image_url: '',
                link_url: '',
                is_active: true,
                start_date: '',
                end_date: '',
                display_order: 0
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
            title: '',
            description: '',
            image_url: '',
            link_url: '',
            is_active: true,
            start_date: '',
            end_date: '',
            display_order: 0
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5000000) {
            alert('Kích thước file không được vượt quá 5MB');
            return;
        }

        try {
            setUploading(true);
            const response = await uploadBannerImage(file);
            setFormData(prev => ({
                ...prev,
                image_url: response.data.url
            }));
            alert('Tải ảnh lên thành công!');
        } catch (err) {
            console.error('Error uploading image:', err);
            alert(err.response?.data?.error || 'Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.image_url.trim()) {
            alert('Tiêu đề và URL hình ảnh là bắt buộc');
            return;
        }

        try {
            if (editingBanner) {
                await updateBanner(editingBanner.banner_id, formData);
                alert('Cập nhật banner thành công!');
            } else {
                await createBanner(formData);
                alert('Tạo banner thành công!');
            }
            handleCloseModal();
            fetchBanners();
        } catch (err) {
            console.error('Error saving banner:', err);
            alert(err.response?.data?.error || 'Lỗi khi lưu banner');
        }
    };

    const handleToggleStatus = async (banner) => {
        try {
            await updateBannerStatus(banner.banner_id, !banner.is_active);
            fetchBanners();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (bannerId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            return;
        }

        try {
            await deleteBanner(bannerId);
            alert('Xóa banner thành công!');
            fetchBanners();
        } catch (err) {
            console.error('Error deleting banner:', err);
            alert('Lỗi khi xóa banner');
        }
    };

    if (loading) return <p className="text-center py-10">Đang tải...</p>;
    if (error) return <p className="text-center py-10 text-red-600">{error}</p>;

    return (
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-bold">Quản lý Banner</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                >
                    ➕ Thêm Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    Chưa có banner nào
                </div>
            ) : (
                <>
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                    {banners.map(banner => (
                        <div key={banner.banner_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {banner.image_url && (
                                <img src={banner.image_url} alt={banner.title} className="w-full h-32 object-cover" />
                            )}
                            <div className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 flex-1">
                                        <span className="font-semibold text-sm text-gray-800 block truncate">{banner.title}</span>
                                        {banner.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{banner.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(banner)}
                                        className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}
                                    >
                                        {banner.is_active ? '✅ On' : 'Off'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                    <span>
                                        {banner.start_date ? new Date(banner.start_date).toLocaleDateString('vi-VN') : ''}
                                        {banner.start_date && banner.end_date ? ' → ' : ''}
                                        {banner.end_date ? new Date(banner.end_date).toLocaleDateString('vi-VN') : ''}
                                        {!banner.start_date && !banner.end_date ? 'Không giới hạn' : ''}
                                    </span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full font-semibold">#{banner.display_order}</span>
                                </div>
                                <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                                    <button onClick={() => handleOpenModal(banner)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Sửa</button>
                                    <button onClick={() => handleDelete(banner.banner_id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Xóa</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hình ảnh</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian hiển thị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thứ tự</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {banners.map(banner => (
                                <tr key={banner.banner_id}>
                                    <td className="px-6 py-4">
                                        <img 
                                            src={banner.image_url} 
                                            alt={banner.title}
                                            className="h-16 w-24 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold">{banner.title}</div>
                                        {banner.description && (
                                            <div className="text-sm text-gray-500">{banner.description}</div>
                                        )}
                                        {banner.link_url && (
                                            <a 
                                                href={banner.link_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {banner.link_url}
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {banner.start_date && (
                                            <div>Từ: {new Date(banner.start_date).toLocaleDateString('vi-VN')}</div>
                                        )}
                                        {banner.end_date && (
                                            <div>Đến: {new Date(banner.end_date).toLocaleDateString('vi-VN')}</div>
                                        )}
                                        {!banner.start_date && !banner.end_date && (
                                            <span className="text-gray-500">Không giới hạn</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-semibold">
                                            {banner.display_order}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(banner)}
                                            className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                                banner.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}
                                        >
                                            {banner.is_active ? 'Hoạt động' : 'Tắt'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(banner)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.banner_id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                   Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-0">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-4">
                            {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">Tiêu đề *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Hình ảnh *</label>
                                
                                {/* Upload from device */}
                                <div className="mb-3">
                                    <label className="block text-sm text-gray-600 mb-2">Tải lên từ thiết bị:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        disabled={uploading}
                                    />
                                    {uploading && (
                                        <p className="text-sm text-blue-600 mt-1">Đang tải lên...</p>
                                    )}
                                </div>

                                {/* Or enter URL */}
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">Hoặc nhập URL:</label>
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                {/* Preview */}
                                {formData.image_url && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                                        <img 
                                            src={formData.image_url} 
                                            alt="Preview" 
                                            className="h-32 object-cover rounded border"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'block';
                                            }}
                                        />
                                        <p className="text-sm text-red-500 mt-1" style={{ display: 'none' }}>
                                            Không thể tải ảnh. Vui lòng kiểm tra URL.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Link (URL)</label>
                                <input
                                    type="url"
                                    name="link_url"
                                    value={formData.link_url}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-1">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold mb-1">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1">Thứ tự hiển thị</label>
                                <input
                                    type="number"
                                    name="display_order"
                                    value={formData.display_order}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Số nhỏ hơn sẽ hiển thị trước</p>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label className="font-semibold">Kích hoạt ngay</label>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingBanner ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBannersPage;
