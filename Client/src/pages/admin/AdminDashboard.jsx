import { useState } from 'react';
import AdminProductsTab from '../../components/admin/AdminProductsTab';
import AdminPromotionsTab from '../../components/admin/AdminPromotionsTab';
import AdminCategoriesBrandsTab from '../../components/admin/AdminCategoriesBrandsTab';

/**
 * @page AdminDashboard
 * @description Admin dashboard - tập hợp các quản lý
 * Tách từng chức năng vào tab components riêng
 * @category Admin
 */

const AdminDashboard = () => {
  const [tab, setTab] = useState('products');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4">
          <button
            onClick={() => setTab('products')}
            className={`py-3 px-4 font-medium border-b-2 ${
              tab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sản phẩm
          </button>

          <button
            onClick={() => setTab('promotions')}
            className={`py-3 px-4 font-medium border-b-2 ${
              tab === 'promotions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Khuyến mãi
          </button>

          <button
            onClick={() => setTab('categories-brands')}
            className={`py-3 px-4 font-medium border-b-2 ${
              tab === 'categories-brands'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Danh mục & Thương hiệu
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {tab === 'products' && <AdminProductsTab />}
        {tab === 'promotions' && <AdminPromotionsTab />}
        {tab === 'categories-brands' && <AdminCategoriesBrandsTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;