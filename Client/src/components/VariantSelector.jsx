import { useState, useEffect } from 'react';

const VariantSelector = ({ variants, onSelect, selectedVariantId }) => {
  const [selectedId, setSelectedId] = useState(selectedVariantId || (variants[0]?.variant_id ?? ''));

  useEffect(() => {
    if (selectedVariantId) setSelectedId(selectedVariantId);
  }, [selectedVariantId]);

  if (!Array.isArray(variants) || variants.length === 0) {
    return (
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">Chọn biến thể:</label>
        <div className="mt-2 text-gray-400">Không có biến thể</div>
      </div>
    );
  }

  const selectedVariant = variants.find(v => v.variant_id === selectedId) || variants[0];

  return (
    <div className="mt-2">
      <label className="block text-lg font-bold text-gray-800 mb-3">Chọn size:</label>
      <div className="flex flex-wrap gap-4">
        {variants.map((variant) => (
          <button
            key={variant.variant_id}
            type="button"
            className={`min-w-[64px] px-5 py-2 rounded-xl border font-semibold text-base transition
              ${selectedId === variant.variant_id
                ? 'bg-blue-600 text-white border-blue-700 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'}
            `}
            onClick={() => {
              setSelectedId(variant.variant_id);
              onSelect && onSelect(variant);
            }}
          >
            {variant.size ? variant.size : variant.sku || 'Không xác định'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VariantSelector;