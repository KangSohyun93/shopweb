import StarRating from './StarRating';

const ReviewsSection = ({ reviews }) => {
    return (
        <div className="mt-16 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Đánh giá từ khách hàng</h2>
            {reviews.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.review_id} className="flex gap-4 border-b pb-6 last:border-0 last:pb-0">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                {review.username ? review.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-semibold text-gray-900">{review.username || 'Khách hàng ẩn danh'}</span>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{new Date(review.created_at).toLocaleString('vi-VN')}</p>
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;
