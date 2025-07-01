import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [tab, setTab] = useState('products');
    const [error, setError] = useState(null);

    const [products, setProducts] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [filterCategory, setFilterCategory] = useState(''); 
    const [filterBrand, setFilterBrand] = useState('');  

    const [editedItems, setEditedItems] = useState({});

    const [editMode, setEditMode] = useState(null);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingBrandId, setEditingBrandId] = useState(null);
   
    useEffect(() => {
        setError(null);
        setEditedItems({});
        setEditMode(null);
        setEditingCategoryId(null);
        setEditingBrandId(null);
        setCurrentPage(1);
        setSearchTerm('');
        setFilterCategory(''); 
        setFilterBrand(''); 

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                  setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
                  return;
                }
                const headers = { Authorization: `Bearer ${token}` };

                if (tab === 'products') {
                    const [pRes, cRes, bRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/products', { headers }),
                        axios.get('http://localhost:5000/api/categories', { headers }),
                        axios.get('http://localhost:5000/api/brands', { headers }),
                    ]);
                    setProducts(pRes.data || []);
                    setCategories(cRes.data || []);
                    setBrands(bRes.data || []);
                } else if (tab === 'promotions') {
                    const promoRes = await axios.get('http://localhost:5000/api/promotions', { headers });
                    setPromotions(promoRes.data || []);
                } else if (tab === 'categories-brands') {
                    const [cRes, bRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/categories', { headers }),
                        axios.get('http://localhost:5000/api/brands', { headers }),
                    ]);
                    setCategories(cRes.data || []);
                    setBrands(bRes.data || []);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.error || 'Không thể tải dữ liệu. Vui lòng kiểm tra lại server.');
            }
        };

        fetchData();
    }, [tab]);

  
    const handleChange = (id, field, value) => {
        setEditedItems(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
    };

    const handleEdit = (type, id, currentItem) => {
        setEditedItems(prev => ({ ...prev, [id]: { ...currentItem } }));
        if (type === 'products' || type === 'promotions') setEditMode(id);
        if (type === 'categories') setEditingCategoryId(id);
        if (type === 'brands') setEditingBrandId(id);
    };

    const handleCancelEdit = (type, id) => {
        if (id.toString().includes('new_')) {
            if (type === 'products') setProducts(prev => prev.filter(p => p.product_id !== id));
            if (type === 'promotions') setPromotions(prev => prev.filter(p => p.promotion_id !== id));
            if (type === 'categories') setCategories(prev => prev.filter(c => c.category_id !== id));
            if (type === 'brands') setBrands(prev => prev.filter(b => b.brand_id !== id));
        }
        if (type === 'products' || type === 'promotions') setEditMode(null);
        if (type === 'categories') setEditingCategoryId(null);
        if (type === 'brands') setEditingBrandId(null);
        setEditedItems(prev => { const newItems = { ...prev }; delete newItems[id]; return newItems; });
    };

    const handleAdd = (type) => {
        const newId = `new_${Date.now()}`;
        if (type === 'products') {
            const newItem = { product_id: newId, name: '', description: '', category_id: null, brand_id: null, primary_image_url: '', additional_images: [], variants: [{ sku: '', size: '', price: 0, stock_quantity: 0 }] };
            setProducts([newItem, ...products]);
            handleEdit('products', newId, newItem);
        } else if (type === 'promotions') {
            const newItem = { promotion_id: newId, code: '', description: '', discount_type: 'percentage', discount_value: 0, start_date: '', end_date: '', min_order_value: 0 };
            setPromotions([newItem, ...promotions]);
            handleEdit('promotions', newId, newItem);
        } else if (type === 'categories') {
            const newItem = { category_id: newId, name: '', description: '', parent_id: null };
            setCategories([newItem, ...categories]);
            handleEdit('categories', newId, newItem);
        } else if (type === 'brands') {
            const newItem = { brand_id: newId, name: '', description: '' };
            setBrands([newItem, ...brands]);
            handleEdit('brands', newId, newItem);
        }
    };
  
    const handleSave = async (type, id) => {
    const itemData = editedItems[id];
    if (!itemData) {
        console.error("Không có dữ liệu để lưu cho id:", id);
        return;
    }

    const isNew = id.toString().includes('new_');
    const apiUrl = `http://localhost:5000/api/${type}` + (isNew ? '' : `/${id}`);
    const apiMethod = isNew ? axios.post : axios.put;
    const token = localStorage.getItem('token');
    const idField = type === 'products' ? 'product_id' : type === 'promotions' ? 'promotion_id' : type === 'categories' ? 'category_id' : 'brand_id';

    try {
        const response = await apiMethod(apiUrl, itemData, { headers: { Authorization: `Bearer ${token}` } });

        let finalSavedItem;
        if (isNew) {
            const newIdFromServer = response.data.id || response.data[idField];
            finalSavedItem = { ...itemData, [idField]: newIdFromServer };

        } else {
            finalSavedItem = { ...itemData };
        }

        const updateStateList = (setter) => {
            setter(prevList => prevList.map(item => (item[idField] === id ? finalSavedItem : item)));
        };

        if (type === 'products') updateStateList(setProducts);
        if (type === 'promotions') updateStateList(setPromotions);
        if (type === 'categories') updateStateList(setCategories);
        if (type === 'brands') updateStateList(setBrands);
        if (type === 'products' || type === 'promotions') setEditMode(null);
        if (type === 'categories') setEditingCategoryId(null);
        if (type === 'brands') setEditingBrandId(null);

        setEditedItems(prev => {
            const newItems = { ...prev };
            delete newItems[id];
            return newItems;
        });

    } catch (err) {
        console.error(`Error saving ${type}:`, err);
        setError(err.response?.data?.error || `Không thể lưu ${type}.`);
    }
};


    const handleDelete = async (type, id) => {
        if (!window.confirm(`Bạn có chắc muốn xóa mục này không?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/${type}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (type === 'products') setProducts(prev => prev.filter(p => p.product_id !== id));
            if (type === 'promotions') setPromotions(prev => prev.filter(p => p.promotion_id !== id));
            if (type === 'categories') setCategories(prev => prev.filter(c => c.category_id !== id));
            if (type === 'brands') setBrands(prev => prev.filter(b => b.brand_id !== id));
        } catch (err) {
            console.error(`Error deleting ${type}:`, err);
            setError(err.response?.data?.error || 'Không thể xóa mục.');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm đã chọn không?`)) return;
        try {
            await Promise.all(selectedProducts.map(id => axios.delete(`http://localhost:5000/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })));
            setProducts(prev => prev.filter(p => !selectedProducts.includes(p.product_id)));
            setSelectedProducts([]);
        } catch (err) { setError('Lỗi khi xóa hàng loạt sản phẩm.'); }
    };
  
    const handleVariantChange = (productId, index, field, value) => {
        const newVariants = [...(editedItems[productId]?.variants || [])];
        newVariants[index] = { ...newVariants[index], [field]: value };
        handleChange(productId, 'variants', newVariants);
    };

    const handleAddVariant = (productId) => {
        const newVariants = [...(editedItems[productId]?.variants || []), { sku: '', size: '', price: 0, stock_quantity: 0 }];
        handleChange(productId, 'variants', newVariants);
    };
  
    const handleRemoveVariant = (productId, index) => {
        const variants = editedItems[productId]?.variants || [];
        if (variants.length <= 1) { setError('Phải có ít nhất một biến thể.'); return; }
        const newVariants = variants.filter((_, i) => i !== index);
        handleChange(productId, 'variants', newVariants);
    };
    
    const handleImageUpload = async (productId, file, endpoint, field, isMultiple = false) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await axios.post(`http://localhost:5000/api/products/${endpoint}/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (isMultiple) {
                const currentImages = editedItems[productId]?.[field] || [];
                handleChange(productId, field, [...currentImages, response.data]);
            } else {
                handleChange(productId, field, response.data.image_url);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi upload ảnh.');
        }
    };

    const handleAdditionalImageDelete = async (productId, imageId) => {
        try {
            await axios.delete(`http://localhost:5000/api/products/delete-additional-image/${imageId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const updatedImages = (editedItems[productId]?.additional_images || []).filter(img => img.image_id !== imageId);
            handleChange(productId, 'additional_images', updatedImages);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi xóa ảnh phụ.');
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString().slice(0, 16); } catch (e) { return ''; }
    };

const filteredProducts = products.filter(product => {
    const matchesCategoryFilter = !filterCategory || product.category_id == filterCategory;
    const matchesBrandFilter = !filterBrand || product.brand_id == filterBrand;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) {
        return matchesCategoryFilter && matchesBrandFilter;
    }

    const categoryName = categories.find(c => c.category_id === product.category_id)?.name || '';
    const brandName = brands.find(b => b.brand_id === product.brand_id)?.name || '';
    const hasMatchingSku = product.variants?.some(variant => 
        variant.sku?.toLowerCase().includes(lowerCaseSearchTerm)
    );

    const matchesTextSearch = 
        product.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
        categoryName.toLowerCase().includes(lowerCaseSearchTerm) ||
        brandName.toLowerCase().includes(lowerCaseSearchTerm) ||
        hasMatchingSku;
    
    return matchesCategoryFilter && matchesBrandFilter && matchesTextSearch;
});

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    return (
        <div className="container mx-auto py-2 px-4">
            <h3 className="text-3xl font-extrabold mb-8 text-[#22336b] text-center">Admin Dashboard</h3>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button onClick={() => setTab('products')} className={`px-6 py-2 rounded-xl font-semibold shadow transition ${tab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#22336b] hover:bg-blue-50'}`}>Sản phẩm</button>
                <button onClick={() => setTab('promotions')} className={`px-6 py-2 rounded-xl font-semibold shadow transition ${tab === 'promotions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#22336b] hover:bg-blue-50'}`}>Khuyến mãi</button>
                <button onClick={() => setTab('categories-brands')} className={`px-6 py-2 rounded-xl font-semibold shadow transition ${tab === 'categories-brands' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-[#22336b] hover:bg-blue-50'}`}>Danh mục/Thương hiệu</button>
            </div>

            {tab === 'products' && (
    <div>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <button onClick={() => handleAdd('products')} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-green-700 transition">+ Thêm sản phẩm</button>
            
            <div className="flex items-center gap-4 flex-grow">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border rounded-lg px-3 py-2 bg-white">
                    <option value="">Tất cả Danh mục</option>
                    {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                </select>
                <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="border rounded-lg px-3 py-2 bg-white">
                    <option value="">Tất cả Thương hiệu</option>
                    {brands.map((brand) => (
                        <option key={brand.brand_id} value={brand.brand_id}>{brand.name}</option>
                    ))}
                </select>
                <input type="text" placeholder="Tìm kiếm theo tên sản phẩm..." className="border rounded-lg px-4 py-2 w-full md:w-1/3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-600">Tổng: {filteredProducts.length}</span>
                {selectedProducts.length > 0 && <button onClick={handleBulkDelete} className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-red-600 transition">Xóa ({selectedProducts.length})</button>}
            </div>
        </div>
         <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow">
                <thead className="bg-gray-100 text-[#22336b] sticky top-0">
                    <tr>
                        <th className="p-2 border-b w-12"><input type="checkbox" onChange={(e) => setSelectedProducts(e.target.checked ? products.map((p) => p.product_id) : [])} /></th>
                        <th className="p-2 border-b text-left">Tên sản phẩm</th>
                        <th className="p-2 border-b text-left w-1/4">Mô tả</th>

                        <th className="p-2 border-b">Ảnh chính</th>
                        <th className="p-2 border-b">Ảnh phụ</th>
                        <th className="p-2 border-b w-1/4">Biến thể</th>
                        <th className="p-2 border-b">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.map((product) => {
                        const isEditing = editMode === product.product_id;
                        const item = isEditing ? editedItems[product.product_id] || {} : product;
                        return (
                        <tr key={product.product_id} className="hover:bg-gray-50 align-top">
                            <td className="p-2 border-b text-center"><input type="checkbox" checked={selectedProducts.includes(product.product_id)} onChange={(e) => setSelectedProducts(e.target.checked ? [...selectedProducts, product.product_id] : selectedProducts.filter((id) => id !== product.product_id))} disabled={isEditing} /></td>
                            
                            <td className="p-2 border-b">
                                {isEditing ? (
                                    <div className="flex flex-col gap-2">
                                        <input type="text" placeholder="Tên sản phẩm" value={item.name} onChange={(e) => handleChange(product.product_id, 'name', e.target.value)} className="w-full border rounded px-2 py-1" />
                                        <select value={item.category_id || ''} onChange={(e) => handleChange(product.product_id, 'category_id', e.target.value || null)} className="w-full border rounded px-2 py-1"><option value="">Chọn danh mục</option>{categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}</select>
                                        <select value={item.brand_id || ''} onChange={(e) => handleChange(product.product_id, 'brand_id', e.target.value || null)} className="w-full border rounded px-2 py-1"><option value="">Chọn thương hiệu</option>{brands.map((b) => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}</select>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="font-semibold block">{item.name}</span>
                                        <p className="text-xs text-gray-500">{categories.find(c => c.category_id == item.category_id)?.name} / {brands.find(b => b.brand_id == item.brand_id)?.name}</p>
                                    </div>
                                )}
                            </td>

                            <td className="p-2 border-b">
                                {isEditing ? (
                                    <textarea 
                                        placeholder="Mô tả sản phẩm" 
                                        value={item.description || ''} 
                                        onChange={(e) => handleChange(product.product_id, 'description', e.target.value)} 
                                        className="w-full border rounded px-2 py-1 text-sm" 
                                        rows="5"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {item.description || 'Không có mô tả'}
                                    </p>
                                )}
                            </td>
                            
                            <td className="p-2 border-b text-center">
                                {isEditing ? (
                                    <div>
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(product.product_id, e.target.files[0], 'upload-primary-image', 'primary_image_url')} className="w-full text-xs" />
                                        {item.primary_image_url && <img src={item.primary_image_url} alt="Ảnh chính" className="w-16 h-16 object-cover rounded border mx-auto mt-2"/>}
                                    </div>
                                ) : (
                                    item.primary_image_url ? <img src={item.primary_image_url} alt="Ảnh chính" className="w-16 h-16 object-cover rounded border mx-auto"/> : <span className="text-gray-400 italic text-xs">Chưa có</span>
                                )}
                            </td>
                            
                            <td className="p-2 border-b">
                                {isEditing ? (
                                    <div>
                                        <input type="file" accept="image/*" multiple onChange={(e) => Array.from(e.target.files).forEach(file => handleImageUpload(product.product_id, file, 'upload-additional-image', 'additional_images', true))} className="w-full text-xs" />
                                        <div className="grid grid-cols-3 gap-1 mt-2">{item.additional_images?.map(img => (
                                            <div key={img.image_id} className="relative"><img src={img.image_url} alt="Ảnh phụ" className="w-12 h-12 object-cover rounded border" /><button onClick={() => handleAdditionalImageDelete(product.product_id, img.image_id)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center -mt-1 -mr-1">X</button></div>
                                        ))}</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-1">{item.additional_images?.map(img => <img key={img.image_id} src={img.image_url} alt="Ảnh phụ" className="w-12 h-12 object-cover rounded border"/>)}</div>
                                )}
                            </td>
                            
                            <td className="p-2 border-b">{isEditing ? <div>{item.variants?.map((v, i) => (<div key={i} className="mb-2 p-2 border rounded"><input type="text" placeholder="SKU" value={v.sku} onChange={e => handleVariantChange(product.product_id, i, 'sku', e.target.value)} className="w-full mb-1 p-1 border rounded" /><input type="text" placeholder="Size" value={v.size} onChange={e => handleVariantChange(product.product_id, i, 'size', e.target.value)} className="w-full mb-1 p-1 border rounded" /><input type="number" placeholder="Giá" value={v.price} onChange={e => handleVariantChange(product.product_id, i, 'price', e.target.value)} className="w-full mb-1 p-1 border rounded" /><input type="number" placeholder="Tồn kho" value={v.stock_quantity} onChange={e => handleVariantChange(product.product_id, i, 'stock_quantity', e.target.value)} className="w-full mb-1 p-1 border rounded" />{item.variants.length > 1 && <button onClick={() => handleRemoveVariant(product.product_id, i)} className="text-red-500 text-sm mt-1">Xóa biến thể</button>}</div>))}<button onClick={() => handleAddVariant(product.product_id)} className="bg-blue-100 text-blue-800 px-2 py-1 text-sm rounded mt-2">+ Thêm biến thể</button></div> : <ul>{item.variants?.map(v => <li key={v.variant_id} className="text-sm">Size {v.size} - {Number(v.price).toLocaleString('vi-VN')}đ</li>)}</ul>}</td>
                            <td className="p-2 border-b text-center"><div className="flex gap-2 justify-center">{isEditing ? (<><button onClick={() => handleSave('products', product.product_id)} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button><button onClick={() => handleCancelEdit('products', product.product_id)} className="bg-gray-500 text-white px-3 py-1 rounded">Hủy</button></>) : (<><button onClick={() => handleEdit('products', product.product_id, product)} className="bg-yellow-500 text-white px-3 py-1 rounded">Sửa</button><button onClick={() => handleDelete('products', product.product_id)} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button></>)}</div></td>
                        </tr>);
                    })}
                </tbody>
            </table>
        </div>
    </div>
)}

            
            {tab === 'promotions' && (
    <div>
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => handleAdd('promotions')} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-green-700 transition">+ Thêm khuyến mãi</button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow">
                <thead className="bg-gray-100 text-[#22336b] sticky top-0">
                    <tr>
                        <th className="py-3 px-4 border-b">Mã</th>
                        <th className="py-3 px-4 border-b">Mô tả</th>
                        <th className="py-3 px-4 border-b">Loại/Giá trị</th>
                        <th className="py-3 px-4 border-b">Đơn tối thiểu</th>
                        <th className="py-3 px-4 border-b">Thời gian</th>
                        <th className="py-3 px-4 border-b">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map((promo) => {
                        const isEditing = editMode === promo.promotion_id;
                        const item = isEditing ? editedItems[promo.promotion_id] || {} : promo;
                        return (
                        <tr key={promo.promotion_id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b">{isEditing ? <input type="text" value={item.code || ''} onChange={e => handleChange(promo.promotion_id, 'code', e.target.value)} className="w-full p-1 border rounded"/> : <strong>{item.code}</strong>}</td>
                            <td className="py-3 px-4 border-b">{isEditing ? <textarea value={item.description || ''} onChange={e => handleChange(promo.promotion_id, 'description', e.target.value)} className="w-full p-1 border rounded" rows="2"/> : <p className="text-sm text-gray-600">{item.description}</p>}</td>
                            
                            <td className="py-3 px-4 border-b">{isEditing ? <div className="flex gap-2"><select value={item.discount_type} onChange={e => handleChange(promo.promotion_id, 'discount_type', e.target.value)} className="p-1 border rounded"><option value="percentage">Phần trăm</option><option value="fixed">Cố định</option></select><input type="number" value={item.discount_value || 0} onChange={e => handleChange(promo.promotion_id, 'discount_value', e.target.value)} className="w-24 p-1 border rounded"/></div> : <span>{item.discount_value} {item.discount_type === 'percentage' ? '%' : 'VND'}</span>}</td>
                            
                            <td className="py-3 px-4 border-b">
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        value={item.min_order_value || 0} 
                                        onChange={e => handleChange(promo.promotion_id, 'min_order_value', e.target.value)} 
                                        className="w-full p-1 border rounded"
                                    />
                                ) : (
                                    <span>{Number(item.min_order_value || 0).toLocaleString('vi-VN')} VND</span>
                                )}
                            </td>

                            <td className="py-3 px-4 border-b">{isEditing ? <div className="flex flex-col gap-2"><input type="datetime-local" value={formatDateTime(item.start_date)} onChange={e => handleChange(promo.promotion_id, 'start_date', e.target.value)} className="p-1 border rounded" /><input type="datetime-local" value={formatDateTime(item.end_date)} onChange={e => handleChange(promo.promotion_id, 'end_date', e.target.value)} className="p-1 border rounded" /></div> : <div className="text-sm">Từ: {new Date(item.start_date).toLocaleString('vi-VN')}<br/>Đến: {new Date(item.end_date).toLocaleString('vi-VN')}</div>}</td>
                            
                            <td className="py-3 px-4 border-b"><div className="flex gap-2 justify-center">{isEditing ? (<><button onClick={() => handleSave('promotions', promo.promotion_id)} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button><button onClick={() => handleCancelEdit('promotions', promo.promotion_id)} className="bg-gray-500 text-white px-3 py-1 rounded">Hủy</button></>) : (<><button onClick={() => handleEdit('promotions', promo.promotion_id, promo)} className="bg-yellow-500 text-white px-3 py-1 rounded">Sửa</button><button onClick={() => handleDelete('promotions', promo.promotion_id)} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button></>)}</div></td>
                        </tr>
                        )
                    })}</tbody>
                </table>
            </div>
        </div>
    )}

            {tab === 'categories-brands' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-[#22336b]">Quản lý Danh mục</h3><button onClick={() => handleAdd('categories')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">+ Thêm danh mục</button></div>
                        <div className="overflow-x-auto bg-white rounded-lg shadow"><table className="min-w-full">
                            <thead className="bg-gray-100"><tr><th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tên danh mục</th><th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Mô tả</th><th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Danh mục cha</th><th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Hành động</th></tr></thead>
                            <tbody>{categories.map((category) => {
                                const isEditing = editingCategoryId === category.category_id;
                                const item = isEditing ? editedItems[category.category_id] || {} : category;
                                return (<tr key={category.category_id} className="border-t">
                                    <td className="py-3 px-4">{isEditing ? <input type="text" value={item.name} onChange={e => handleChange(category.category_id, 'name', e.target.value)} className="w-full border rounded px-2 py-1"/> : <span>{item.name}</span>}</td>
                                    <td className="py-3 px-4">{isEditing ? <textarea value={item.description} onChange={e => handleChange(category.category_id, 'description', e.target.value)} className="w-full border rounded px-2 py-1" rows="2"/> : <span className="text-sm text-gray-500">{item.description}</span>}</td>
                                    <td className="py-3 px-4">{isEditing ? <select value={item.parent_id || ''} onChange={e => handleChange(category.category_id, 'parent_id', e.target.value || null)} className="w-full border rounded px-2 py-1"><option value="">Không có</option>{categories.filter(c => c.category_id !== category.category_id).map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}</select> : <span>{categories.find(c => c.category_id === item.parent_id)?.name || 'Không có'}</span>}</td>
                                    <td className="py-3 px-4"><div className="flex gap-2 justify-center">{isEditing ? (<><button onClick={() => handleSave('categories', category.category_id)} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button><button onClick={() => handleCancelEdit('categories', category.category_id)} className="bg-gray-500 text-white px-3 py-1 rounded">Hủy</button></>) : (<><button onClick={() => handleEdit('categories', category.category_id, category)} className="bg-yellow-500 text-white px-3 py-1 rounded">Sửa</button><button onClick={() => handleDelete('categories', category.category_id)} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button></>)}</div></td>
                                </tr>)
                            })}</tbody>
                        </table></div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-[#22336b]">Quản lý Thương hiệu</h3><button onClick={() => handleAdd('brands')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition">+ Thêm thương hiệu</button></div>
                        <div className="overflow-x-auto bg-white rounded-lg shadow"><table className="min-w-full">
                            <thead className="bg-gray-100"><tr><th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tên thương hiệu</th><th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Mô tả</th><th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Hành động</th></tr></thead>
                            <tbody>{brands.map((brand) => {
                                const isEditing = editingBrandId === brand.brand_id;
                                const item = isEditing ? editedItems[brand.brand_id] || {} : brand;
                                return (<tr key={brand.brand_id} className="border-t">
                                    <td className="py-3 px-4">{isEditing ? <input type="text" value={item.name} onChange={e => handleChange(brand.brand_id, 'name', e.target.value)} className="w-full border rounded px-2 py-1"/> : <span>{item.name}</span>}</td>
                                    <td className="py-3 px-4">{isEditing ? <textarea value={item.description} onChange={e => handleChange(brand.brand_id, 'description', e.target.value)} className="w-full border rounded px-2 py-1" rows="2"/> : <span className="text-sm text-gray-500">{item.description}</span>}</td>
                                    <td className="py-3 px-4"><div className="flex gap-2 justify-center">{isEditing ? (<><button onClick={() => handleSave('brands', brand.brand_id)} className="bg-blue-500 text-white px-3 py-1 rounded">Lưu</button><button onClick={() => handleCancelEdit('brands', brand.brand_id)} className="bg-gray-500 text-white px-3 py-1 rounded">Hủy</button></>) : (<><button onClick={() => handleEdit('brands', brand.brand_id, brand)} className="bg-yellow-500 text-white px-3 py-1 rounded">Sửa</button><button onClick={() => handleDelete('brands', brand.brand_id)} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button></>)}</div></td>
                                </tr>)
                            })}</tbody>
                        </table></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;