import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Theo dõi sự thay đổi của Token trong localStorage để tự động kết nối/ngắt kết nối
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };

    // Chu kỳ kiểm tra 1 giây phòng trường hợp storage event không kích hoạt trong cùng tab
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      setSocket(null);
      return;
    }

    // Khởi tạo kết nối Socket (cho phép WebSockets và Polling để mượt mà hơn)
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        if (payload.user_id) {
          // Tất cả mọi người (kể cả admin) đều join vào room user của mình để nhận tin nhắn real-time gửi cho chính họ
          newSocket.emit('user:join', payload.user_id);

          if (payload.role === 'admin') {
            newSocket.emit('admin:join', payload.user_id);
            newSocket.emit('admin:join-room');
          }
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
