import { useState, useEffect } from 'react';

const ReviewModal = ({ isOpen, onClose, product, orderId, existingReview, onReviewSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment || '');
        } else {
            setRating(5);
            setComment('');
        }
        setError('');
    }, [existingReview, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onReviewSubmitted({ rating, comment });
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Không thể gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const canEdit = !existingReview || existingReview.edit_count < 1;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                            {existingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {product && (
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                            <img
                                src={product.primary_image_url || 'https://placehold.co/80'}
                                alt={product.product_name}
                                className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                                <p className="font-semibold text-gray-800">{product.product_name}</p>
                                <p className="text-sm text-gray-500">Size: {product.size || 'N/A'}</p>
                            </div>
                        </div>
                    )}

                    {!canEdit && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                Bạn đã sử dụng hết lượt chỉnh sửa (1/1). Không thể sửa thêm.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Đánh giá của bạn
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        disabled={!canEdit}
                                        onClick={() => canEdit && setRating(star)}
                                        onMouseEnter={() => canEdit && setHoveredRating(star)}
                                        onMouseLeave={() => canEdit && setHoveredRating(0)}
                                        className={`text-3xl transition-colors ${
                                            !canEdit ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                        }`}
                                    >
                                        <span
                                            className={
                                                star <= (hoveredRating || rating)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }
                                        >
                                            ★
                                        </span>
                                    </button>
                                ))}
                                <span className="text-sm text-gray-600 self-center ml-2">
                                    {rating}/5
                                </span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nhận xét (không bắt buộc)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={!canEdit}
                                rows={4}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                    !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            />
                        </div>

                        {existingReview && (
                            <div className="mb-4 text-xs text-gray-500">
                                <p>Đã sửa: {existingReview.edit_count}/1 lần</p>
                                <p>Đánh giá lúc: {new Date(existingReview.created_at).toLocaleString('vi-VN')}</p>
                                {existingReview.updated_at !== existingReview.created_at && (
                                    <p>Cập nhật lúc: {new Date(existingReview.updated_at).toLocaleString('vi-VN')}</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Đóng
                            </button>
                            {canEdit && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting
                                        ? 'Đang gửi...'
                                        : existingReview
                                        ? 'Cập nhật'
                                        : 'Gửi đánh giá'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
