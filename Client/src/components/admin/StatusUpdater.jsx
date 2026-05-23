import { useState } from 'react';
import { updateOrderStatus } from '../../services/api';

const StatusUpdater = ({ order, onStatusChange }) => {
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    const statusStyles = {
        pending: 'border-yellow-500 text-yellow-800',
        processing: 'border-orange-500 text-orange-800',
        shipped: 'border-blue-500 text-blue-800',
        delivered: 'border-green-500 text-green-800',
        cancelled: 'border-red-500 text-red-800',
        return_requested: 'border-purple-500 text-purple-800',
        returning: 'border-blue-500 text-blue-800',
        refunded: 'border-teal-500 text-teal-800',
        unknown: 'border-gray-300 text-gray-800'
    };

    const statusOptions = [
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'processing', label: 'Đang chuẩn bị' },
        { value: 'shipped', label: 'Đang giao' },
        { value: 'delivered', label: 'Hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' },
        { value: 'returning', label: 'Đang hoàn hàng' },
        { value: 'refunded', label: 'Đã hoàn tiền' },
    ];

    const handleSelectChange = async (e) => {
        const newStatus = e.target.value;
        setIsUpdating(true);
        setError('');

        try {
            const updatedOrder = await updateOrderStatus(order.order_id, newStatus);
            onStatusChange(updatedOrder.data);
            setCurrentStatus(updatedOrder.data.status);
        } catch (err) {
            console.error('Failed to update status:', err);
            setError('Lỗi!');
            e.target.value = currentStatus;
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative">
            <select
                value={currentStatus}
                onChange={handleSelectChange}
                disabled={isUpdating}
                className={`w-full p-2 border-2 rounded-md text-xs font-semibold appearance-none focus:ring-2 focus:ring-offset-1
                    ${statusStyles[currentStatus] || statusStyles.unknown}
                    ${isUpdating ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}
                `}
            >
                {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {isUpdating && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">...</span>}
            {error && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default StatusUpdater;
