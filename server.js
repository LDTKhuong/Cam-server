const WebSocket = require('ws');
const http = require('http');

// 1. Tạo một Server HTTP cơ bản để Render kiểm tra "sức khỏe" hệ thống
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Cloud connected');
});

// 2. Gắn WebSocket vào Server HTTP này
const wss = new WebSocket.Server({ server });

// 3. Render sẽ tự cấp cổng ngẫu nhiên qua biến process.env.PORT, nếu chạy ở máy tính thì dùng 8081
const PORT = process.env.PORT || 8081;

wss.on('connection', (ws) => {
    console.log('connected:', wss.clients.size);
    
    // Khi nhận được ảnh từ ESP32
    ws.on('message', (data) => {
        // Phát ảnh cho tất cả các thiết bị đang kết nối (Trang Web)
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {
        console.log('connect fail:', wss.clients.size);
    });
});

server.listen(PORT, () => {
    console.log(`server is running ${PORT}`);
});