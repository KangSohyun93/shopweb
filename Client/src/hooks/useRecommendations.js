import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { getRecommendations } from '../services/api';

const useRecommendations = (productId) => {
    const [recommendations, setRecommendations] = useState([]);
    const [recPage, setRecPage] = useState(1);
    const [recHasMore, setRecHasMore] = useState(true);
    const [recIsLoadingMore, setRecIsLoadingMore] = useState(false);
    const [fallbackMode, setFallbackMode] = useState(false);
    const [fallbackPage, setFallbackPage] = useState(1);
    
    const recObserverRef = useRef();

    // 📌 INTERSECTION OBSERVER: Khi scroll tới sản phẩm gợi ý cuối, tải thêm
    const lastRecElementRef = useCallback(node => {
        if (recIsLoadingMore) return;
        if (recObserverRef.current) recObserverRef.current.disconnect();
        
        recObserverRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && recHasMore && !recIsLoadingMore) {
                if (fallbackMode) {
                    setFallbackPage(prevPage => prevPage + 1);
                } else {
                    setRecPage(prevPage => prevPage + 1);
                }
            }
        }, { threshold: 0.1 });
        
        if (node) recObserverRef.current.observe(node);
    }, [recIsLoadingMore, recHasMore, fallbackMode]);

    // 📖 FETCH RECOMMENDATIONS (Infinite Scroll)
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!recHasMore) return;
            
            setRecIsLoadingMore(true);
            try {
                const token = localStorage.getItem('token');
                
                const endpoint = fallbackMode 
                    ? `http://localhost:5000/api/recommendations/homepage?page=${fallbackPage}&limit=10`
                    : `http://localhost:5000/api/recommendations/product/${productId}?page=${recPage}&limit=10`;
                
                const res = await axios.get(endpoint, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                });

                if (res.data.success) {
                    setRecommendations(prev => {
                        // ✅ Append mode: Nối danh sách, loại trùng lặp
                        const newItems = res.data.data.filter(
                            newItem => !prev.some(existingItem => existingItem.product_id === newItem.product_id)
                        );
                        return [...prev, ...newItems];
                    });
                    setRecHasMore(res.data.hasMore);
                }
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setRecIsLoadingMore(false);
            }
        };

        if (fallbackMode) {
            if (fallbackPage > 0) {
                fetchRecommendations();
            }
        } else {
            if (recPage > 1 || recommendations.length === 0) {
                fetchRecommendations();
            }
        }
    }, [recPage, productId, recHasMore, fallbackMode, fallbackPage]);
    
    // 🔄 Switch to fallback mode when product recommendations run out
    useEffect(() => {
        if (!recHasMore && recommendations.length > 0 && !fallbackMode) {
            setFallbackMode(true);
            setFallbackPage(1);
            setRecHasMore(true);
        }
    }, [recHasMore, recommendations.length, fallbackMode]);

    // Initial fetch on mount
    useEffect(() => {
        const fetchInitialRecommendations = async () => {
            try {
                const recRes = await getRecommendations(productId);
                if (recRes && recRes.success) {
                    setRecommendations(recRes.data);
                    setRecHasMore(recRes.hasMore || false);
                }
            } catch (recErr) {
                console.error("Lỗi lấy dữ liệu gợi ý:", recErr);
            }
        };

        if (recommendations.length === 0) {
            fetchInitialRecommendations();
        }
    }, [productId]);

    return {
        recommendations,
        recIsLoadingMore,
        recHasMore,
        lastRecElementRef,
        fallbackMode
    };
};

export default useRecommendations;
