import { useState, useRef } from 'react';
import axios from 'axios';
import {
  uploadPrimaryImage,
  uploadAdditionalImage,
  deletePrimaryImage,
  deleteAdditionalImage,
} from '../../services/productService';

/**
 * @component ProductImageManager
 * @description Quản lý upload/delete ảnh sản phẩm
 * Hỗ trợ: Primary image, Additional images, Variant images
 */

const ProductImageManager = ({ product, onImageUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [additionalImages, setAdditionalImages] = useState(product?.additional_images || []);

  const fileInputRef = useRef(null);
  const additionalFileRef = useRef(null);

  // Upload ảnh chính
  const handleUploadPrimaryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await uploadPrimaryImage(product.product_id, file);
      setSuccess('✅ Upload ảnh chính thành công!');
      onImageUpdate?.();
      fileInputRef.current.value = '';
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ Lỗi upload ảnh chính: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete ảnh chính
  const handleDeletePrimaryImage = async () => {
    if (!window.confirm('Xóa ảnh chính?')) return;

    try {
      setLoading(true);
      setError(null);
      await deletePrimaryImage(product.product_id);
      setSuccess('✅ Xóa ảnh chính thành công!');
      onImageUpdate?.();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ Lỗi xóa ảnh chính: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh phụ
  const handleUploadAdditionalImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const response = await uploadAdditionalImage(product.product_id, file);
      setAdditionalImages([
        ...additionalImages,
        {
          image_id: response.data.image_id,
          image_url: response.data.image_url,
        },
      ]);
      setSuccess('✅ Upload ảnh phụ thành công!');
      additionalFileRef.current.value = '';
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ Lỗi upload ảnh phụ: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete ảnh phụ
  const handleDeleteAdditionalImage = async (imageId) => {
    if (!window.confirm('Xóa ảnh phụ này?')) return;

    try {
      setLoading(true);
      setError(null);
      await deleteAdditionalImage(imageId);
      setAdditionalImages(additionalImages.filter((img) => img.image_id !== imageId));
      setSuccess('✅ Xóa ảnh phụ thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('❌ Lỗi xóa ảnh phụ: ' + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mt-6">
      <h3 className="text-xl font-bold mb-6">📸 Quản lý Ảnh Sản phẩm</h3>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* PRIMARY IMAGE */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h4 className="font-semibold text-lg mb-4">🎯 Ảnh Chính (Primary Image)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display */}
          <div className="flex items-center justify-center bg-gray-100 rounded h-64 overflow-hidden">
            {product?.primary_image_url ? (
              <img
                src={product.primary_image_url}
                alt="Primary"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-400">Chưa có ảnh chính</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col justify-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tải lên ảnh chính mới:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadPrimaryImage}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            {product?.primary_image_url && (
              <button
                onClick={handleDeletePrimaryImage}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                🗑️ Xóa ảnh chính
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADDITIONAL IMAGES */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h4 className="font-semibold text-lg mb-4">📷 Ảnh Phụ (Additional Images)</h4>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Thêm ảnh phụ mới:</label>
          <input
            ref={additionalFileRef}
            type="file"
            accept="image/*"
            onChange={handleUploadAdditionalImage}
            disabled={loading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {additionalImages.map((img) => (
            <div key={img.image_id} className="relative group">
              <img
                src={img.image_url}
                alt="Additional"
                className="w-full h-40 object-cover rounded border border-gray-300"
              />
              <button
                onClick={() => handleDeleteAdditionalImage(img.image_id)}
                disabled={loading}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
        {additionalImages.length === 0 && (
          <p className="text-gray-400 text-center py-4">Chưa có ảnh phụ</p>
        )}
      </div>


      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
          <div className="bg-white p-4 rounded">Đang xử lý...</div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
