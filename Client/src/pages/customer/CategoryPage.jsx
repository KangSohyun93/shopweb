import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState(null);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch danh mục và sản phẩm
        const [catRes, prodRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/products')
        ]);
        
        const allCategories = catRes.data || [];
        const allProducts = prodRes.data || [];
        
        setCategories(allCategories);
        setAllProducts(allProducts);

        // Tìm danh mục cha (parent category)
        const parent = allCategories.find(c => c.category_id.toString() === categoryId.toString());
        if (parent) {
          setParentCategory(parent);
          
          // Tìm danh mục con
          let children = allCategories.filter(c => c.parent_id === parent.category_id);
          
          // Sắp xếp theo số lượng sản phẩm (giảm dần)
          children = children.map(child => {
            const count = allProducts.filter(p => parseInt(p.category_id) === child.category_id).length;
            return { ...child, productCount: count };
          }).sort((a, b) => b.productCount - a.productCount);
          
          setChildCategories(children);
          
          // Debug log
          console.log(`🏪 CATEGORY PAGE - ${parent.name}:`);
          console.log(`  Parent ID: ${parent.category_id}`);
          console.log(`  Children: ${children.length}`, children.map(c => `${c.name} (${c.productCount} sản phẩm)`));
        }
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  // Filter sản phẩm khi selectedChildId thay đổi
  useEffect(() => {
    let validCategoryIds = [parseInt(categoryId)];
    
    if (selectedChildId) {
      // Nếu chọn danh mục con, chỉ hiển thị sản phẩm của danh mục con đó
      validCategoryIds = [selectedChildId];
    } else {
      // Nếu không chọn, hiển thị sản phẩm của cha + tất cả con
      validCategoryIds = [
        parseInt(categoryId),
        ...childCategories.map(c => c.category_id)
      ];
    }

    const filtered = allProducts.filter(p => 
      validCategoryIds.includes(parseInt(p.category_id))
    );
    setProducts(filtered);
  }, [selectedChildId, categoryId, childCategories, allProducts]);

  if (loading) return <div className="text-center py-32 mt-16 text-gray-500">Đang tải bộ sưu tập...</div>;

  return (
    <div className="min-h-screen bg-white mt-16">
      {/* Header with Filter Buttons */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-8">
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider whitespace-nowrap flex-shrink-0">
              {parentCategory?.name || 'Danh mục'}
            </h1>
            
            {/* Filter buttons - bên phải heading */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Nút "Tất cả" */}
              <button
                onClick={() => setSelectedChildId(null)}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  selectedChildId === null
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                }`}
              >
                Tất cả {parentCategory?.name}
              </button>

              {/* Danh mục con */}
              {childCategories.length > 0 ? (
                childCategories.map(child => (
                  <button
                    key={child.category_id}
                    onClick={() => setSelectedChildId(child.category_id)}
                    className={`px-4 py-2 rounded text-sm font-medium transition ${
                      selectedChildId === child.category_id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                    }`}
                  >
                    {child.name}
                  </button>
                ))
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {products.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600 font-medium">
                Hiển thị <span className="font-bold text-gray-900">{products.length}</span> sản phẩm
                {selectedChildId && 
                  <span className="text-red-600 ml-2">
                    ({childCategories.find(c => c.category_id === selectedChildId)?.name})
                  </span>
                }
              </p>
            </div>

            {/* Lưới sản phẩm */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <Link 
                  key={product.product_id} 
                  to={`/products/${product.product_id}`} 
                  className="group block"
                >
                  <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] mb-4">
                    <img 
                      src={product.primary_image_url} 
                      alt={product.name} 
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full transform group-hover:scale-105 transition duration-500 animate-fadeIn"
                    />
                  </div>
                  <h3 className="text-sm text-gray-700 font-medium truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-900 font-semibold mt-1">
                    {product.variants?.[0]?.price 
                      ? '$' + Number(product.variants[0].price).toLocaleString('en-US') 
                      : 'Liên hệ'
                    }
                  </p>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không có sản phẩm trong danh mục này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
