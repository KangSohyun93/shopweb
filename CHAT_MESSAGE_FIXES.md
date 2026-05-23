# Chat Messaging Logic - Lỗi & Sửa

## 🔴 Lỗi Tìm Được

### 1. **Race Condition - Tin nhắn bị thêm 2 lần**
**File:** ChatWidget.jsx + AdminChatPage.jsx
**Vấn đề:**
- Khi gửi message, client emit socket event
- Server save DB + broadcast `chat:message-sent` (cũ) + `chat:new-message`  
- Client listener thêm message từ cả 2 events → **DUPLICATE**

**Ví dụ:** User gửi "Hello"
1. Server save DB → emit `chat:message-sent` → Client add message
2. Server broadcast `chat:new-message` để admin → admin nhận được
3. Nhưng user cũng nhận được (nếu lắng nghe cùng room) → add lần thứ 2

**Sửa:**
- ✅ Server chỉ gửi **callback** kèm message data cho sender
- ✅ Server broadcast `chat:new-message` CHỈ cho recipient, KHÔNG gửi lại cho sender
- ✅ Client check `message_id` đã tồn tại trước khi add

---

### 2. **Socket Emit Không Có Callback - Không biết gửi thành công hay không**
**File:** ChatWidget.jsx (line 149) + AdminChatPage.jsx (line 134)
**Vấn đề:**
```javascript
// CỦ - không có callback
socket.emit('chat:send-message', { ... });
setNewMessage('');
setSending(false); // Reset ngay, không biết result
```

**Kết quả:**
- `setSending(false)` được gọi ngay, UI reset
- Nếu server lỗi, user không biết
- Message có thể không được lưu

**Sửa:**
```javascript
// MỚI - có callback
socket.emit('chat:send-message', { ... }, (response) => {
  if (response.success) {
    setNewMessage('');
  } else {
    alert(`Lỗi: ${response.error}`);
  }
  setSending(false);
});
```

---

### 3. **Server Không Validate Input**
**File:** Server/index.js (line 118)
**Vấn đề:**
- Không check xem `conversationId`, `message`, `senderType`, `senderId` có không
- Nếu thiếu field, server vẫn cố lưu → lỗi database

**Sửa:**
- ✅ Validate trước: `if (!conversationId || !message || ...)`
- ✅ Gửi error response kèm detail nếu validate fail

---

### 4. **Admin Gửi Tin Không Ai Nhận Được**
**File:** Server/index.js (line 145)
**Vấn đề:**
- Admin gửi tin nhắn cho user
- Server broadcast `chat:new-message` cho admin room
- Nhưng admin KHÔNG nhận được (chỉ user nhận) → admin không thấy message của mình

**Kết quả:** Admin gửi xong, UI không update. Admin phải refresh để thấy tin nhắn của mình.

**Sửa:**
- ✅ Server gửi **callback** cho admin (sender) → admin add message từ callback data
- ✅ Server KHÔNG broadcast lại cho admin khi admin gửi

---

### 5. **User Socket Not Found - Tin nhắn Mất**
**File:** Server/index.js (line 148)
**Vấn đề:**
```javascript
const userSocketId = userSockets.get(conversation.user_id.toString());
if (userSocketId) {
  io.to(userSocketId).emit('chat:new-message', ...);
}
// Nếu user disconnect, tin nhắn SẼ BỊ MẤT!
```

**Sửa:**
- ✅ Log warning khi user socket not found
- ✅ Database đã lưu message, user sẽ tải khi reconnect

---

### 6. **Chat:Message-Sent Event Không Cần Thiết**
**File:** Server/index.js (line 125 cũ)
**Vấn đề:**
- Server gửi `chat:message-sent` để confirmsender
- Nhưng cũng gửi `chat:new-message` → 2 events cho cùng dữ liệu
- Client phải lắng nghe cả 2, có thể conflict

**Sửa:**
- ✅ Dùng **callback** thay vì `chat:message-sent` event
- ✅ Callback response = "Message sent successfully" + message data
- ✅ Client add message từ callback, không cần chờ broadcast

---

## ✅ Tất Cả Sửa Chi Tiết

### **Server (index.js)**
```javascript
socket.on('chat:send-message', async (data, callback) => {
  // 1. Validate input
  if (!conversationId || !message || !senderType || !senderId) {
    callback({ success: false, error: 'Missing fields' });
    return;
  }

  try {
    // 2. Save to database
    const newMessage = await Chat.sendMessage(...);
    
    // 3. Send callback success to sender
    callback({ success: true, data: newMessage });
    
    // 4. Broadcast to recipient ONLY (not sender)
    if (senderType === 'user') {
      io.to('admins').emit('chat:new-message', newMessage);
    } else {
      io.to(userSocketId).emit('chat:new-message', newMessage);
    }
  } catch (error) {
    // 5. Send error callback
    callback({ success: false, error: error.message });
  }
});
```

### **Client - ChatWidget.jsx**
```javascript
socket.emit('chat:send-message', data, (response) => {
  // 1. Callback từ server
  if (response.success) {
    // 2. Add message từ callback data
    setMessages(prev => [...prev, response.data]);
    setNewMessage('');
  } else {
    alert(`Lỗi: ${response.error}`);
  }
  setSending(false);
});

// 3. Lắng nghe newMessage từ admin (chỉ add tin từ admin, không duplicate)
socket.on('chat:new-message', (data) => {
  if (data.sender_type === 'admin') {
    setMessages(prev => {
      // Check duplicate by message_id
      if (prev.some(m => m.message_id === data.message_id)) {
        return prev;
      }
      return [...prev, data];
    });
  }
});
```

### **Client - AdminChatPage.jsx** 
```javascript
socket.emit('chat:send-message', data, (response) => {
  if (response.success) {
    // Add message từ callback
    setMessages(prev => [...prev, response.data]);
    setNewMessage('');
  } else {
    alert(`Lỗi: ${response.error}`);
  }
  setSending(false);
});

socket.on('chat:new-message', (data) => {
  // Add tin từ user, check duplicate
  setMessages(prev => {
    if (prev.some(m => m.message_id === data.message_id)) {
      return prev;
    }
    return [...prev, data];
  });
});
```

---

## 📊 So Sánh Flow Trước & Sau

### **Flow Cũ (Lỗi)**
```
User send → Server receive → Save DB
  ↓
emit chat:message-sent → User add message
emit chat:new-message → Admin add message
  ↓ (LỖI: User cũng nhận được nếu cùng room)
User add lần 2 → DUPLICATE
```

### **Flow Mới (Sửa)**
```
User send → Server receive + validate ✓ → Save DB ✓
  ↓
Callback success + data → User add message ✓
broadcast chat:new-message CHỈ cho admin
  ↓
Admin lắng nghe + check duplicate ✓ → Add tin
  ✓ KHÔNG duplicate, lỗi xử lý tốt
```

---

## 🎯 Kiểm tra Hàm Chính

### User (Customer) Flow
- ✅ Mở chat → load conversation + messages
- ✅ Gửi tin → emit callback → add message từ callback + xóa input
- ✅ Nhận tin từ admin → socket event + check duplicate + mark read
- ✅ Lỗi → show alert, setSending(false) từ callback error

### Admin Flow  
- ✅ Chọn conversation → load messages
- ✅ Gửi tin → emit callback → add message từ callback + xóa input
- ✅ Nhận tin từ user → socket event `chat:new-message` + check duplicate + mark read
- ✅ Lỗi → show alert, setSending(false) từ callback error

---

## 🧪 Test Cases

1. **Test User Gửi → Admin Nhận**
   - User gửi "Hello"
   - Admin phải thấy tin nhắn trong 1 giây
   - Không được thấy duplicate

2. **Test Admin Gửi → User Nhận**  
   - Admin gửi "Reply"
   - User phải thấy tin trong 1 giây
   - Không được thấy duplicate

3. **Test Error Handling**
   - Disconnect socket
   - Gửi tin → error callback  
   - UI phải show alert, setSending(false)

4. **Test Concurrent Messages**
   - Admin gửi 5 tin liên tục
   - User phải nhận đủ 5 tin, không bị mất hoặc duplicate
