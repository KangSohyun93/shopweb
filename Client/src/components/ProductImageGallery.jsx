const ProductImageGallery = ({ product, displayImage, setDisplayImage }) => {
    const galleryImages = [
        ...(product.primary_image_url ? [{ id: 'primary', url: product.primary_image_url }] : []),
        ...(product.additional_images || []).filter(img => img.image_url !== product.primary_image_url).map(img => ({ id: img.image_id, url: img.image_url }))
    ];

    return (
        <div>
            <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                <img src={displayImage} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 hover:scale-105" />
            </div>
            {galleryImages.length > 1 && (
                <div className="mt-4 flex space-x-3 overflow-x-auto p-2">
                    {galleryImages.map(img => (
                        <img key={img.id} src={img.url} alt="Thumbnail" onClick={() => setDisplayImage(img.url)} className={`w-20 h-20 object-contain rounded-lg border-2 cursor-pointer transition ${displayImage === img.url ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-400'}`} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;
