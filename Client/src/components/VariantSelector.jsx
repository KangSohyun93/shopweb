import { useState, useEffect } from 'react';

const VariantSelector = ({ variants, onSelect, selectedVariantId }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (!Array.isArray(variants) || variants.length === 0) return;
    
    // Tìm biến thể đang được chọn hoặc mặc định lấy biến thể đầu tiên
    const current = variants.find(v => v.variant_id === selectedVariantId) || variants[0];
    if (current) {
      setSelectedColor(current.color || 'default');
      setSelectedSize(current.size || 'Free Size');
    }
  }, [selectedVariantId, variants]);

  if (!Array.isArray(variants) || variants.length === 0) {
    return (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">Chọn biến thể:</label>
        <div className="mt-2 text-gray-400">Không có biến thể</div>
      </div>
    );
  }

  // Lấy danh sách màu sắc và kích cỡ độc nhất
  const colors = [...new Set(variants.map(v => v.color || 'default'))];
  const sizes = [...new Set(variants.map(v => v.size || 'Free Size'))];

  // Chỉ hiển thị lựa chọn nếu thông tin không phải là mặc định hoặc có nhiều hơn 1 lựa chọn
  const showColorSelector = colors.length > 1 || (colors.length === 1 && colors[0] !== 'default');
  const showSizeSelector = sizes.length > 1 || (sizes.length === 1 && sizes[0] !== 'Free Size' && sizes[0] !== 'one-size');

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const colorVariants = variants.filter(v => (v.color || 'default') === color);
    
    // Kiểm tra xem size hiện tại có khả dụng với màu mới không
    const match = colorVariants.find(v => (v.size || 'Free Size') === selectedSize);
    if (match) {
      onSelect && onSelect(match);
    } else if (colorVariants.length > 0) {
      // Nếu không khả dụng, chọn size đầu tiên có sẵn của màu đó
      const fallback = colorVariants[0];
      setSelectedSize(fallback.size || 'Free Size');
      onSelect && onSelect(fallback);
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const sizeVariants = variants.filter(v => (v.size || 'Free Size') === size);
    
    // Kiểm tra xem màu hiện tại có khả dụng với size mới không
    const match = sizeVariants.find(v => (v.color || 'default') === selectedColor);
    if (match) {
      onSelect && onSelect(match);
    } else if (sizeVariants.length > 0) {
      // Nếu không khả dụng, chọn màu đầu tiên có sẵn của size đó
      const fallback = sizeVariants[0];
      setSelectedColor(fallback.color || 'default');
      onSelect && onSelect(fallback);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chọn màu sắc */}
      {showColorSelector && (
        <div>
          <label className="block text-base font-bold text-gray-800 mb-2">Chọn màu:</label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  className={`px-4 py-2 rounded-xl border font-semibold text-sm transition
                    ${isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'}
                  `}
                  onClick={() => handleColorChange(color)}
                >
                  {color === 'default' ? 'Mặc định' : color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chọn kích cỡ */}
      {showSizeSelector && (
        <div>
          <label className="block text-base font-bold text-gray-800 mb-2">Chọn size:</label>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  className={`min-w-[48px] px-4 py-2 rounded-xl border font-semibold text-sm transition
                    ${isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'}
                  `}
                  onClick={() => handleSizeChange(size)}
                >
                  {size === 'Free Size' ? 'Freesize' : size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;