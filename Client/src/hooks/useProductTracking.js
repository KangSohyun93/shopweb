import { useEffect, useRef } from 'react';
import axios from 'axios';

const useProductTracking = (productId, categoryId) => {
    const hoverTimerRef = useRef(null);

    // TRACKING: Ghi nhận thời gian dừng lại khi rời khỏi trang
    useEffect(() => {
        const enterTime = Date.now();
        
        return () => {
            const timeSpentSeconds = Math.floor((Date.now() - enterTime) / 1000);
            
            let sessionId = localStorage.getItem('session_id');
            if (!sessionId) {
                sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('session_id', sessionId);
            }

            axios.post('http://localhost:5000/api/tracking', {
                product_id: productId,
                category_id: categoryId,
                interaction_type: 'view',
                dwell_time: timeSpentSeconds,
                session_id: sessionId
            }, {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    'Content-Type': 'application/json'
                }
            }).catch(err => {
                console.log('Tracking silent fail:', err.message);
            });
        };
    }, [productId, categoryId]);

    // 🖱️ HOVER TRACKING: Độ trễ 1 giây
    const handleMouseEnter = () => {
        hoverTimerRef.current = setTimeout(() => {
            let sessionId = localStorage.getItem('session_id');
            if (!sessionId) {
                sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('session_id', sessionId);
            }
            axios.post('http://localhost:5000/api/tracking', {
                product_id: productId,
                category_id: categoryId,
                interaction_type: 'hover',
                session_id: sessionId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
            }).catch(e => console.log('Hover tracking silent fail:', e.message));
        }, 1000);
    };

    // 🖱️ HOVER TRACKING: Hủy nếu rời chuột sớm
    const handleMouseLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
        }
    };

    // 📊 TRACKING: Ghi nhận khi thêm vào giỏ hàng
    const trackAddToCart = () => {
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('session_id', sessionId);
        }
        
        axios.post('http://localhost:5000/api/tracking', {
            product_id: productId,
            category_id: categoryId,
            interaction_type: 'add_to_cart',
            dwell_time: null,
            session_id: sessionId
        }, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Content-Type': 'application/json'
            }
        }).catch(err => {
            console.log('Tracking silent fail:', err.message);
        });
    };

    return { handleMouseEnter, handleMouseLeave, trackAddToCart };
};

export default useProductTracking;
