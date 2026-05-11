const WebSocket = require('ws');

// Khởi tạo Trạm thu phát trên cổng 8080
const PORT = 8081;
const wss = new WebSocket.Server({ host: '0.0.0.0', port: PORT });

console.log(`server is running at ${PORT} ...`);

// Sự kiện: Khi có mạch ESP32 hoặc trang Web kết nối vào
wss.on('connection', (ws) => {
    console.log('new connect, number of devices:', wss.clients.size);

    // Sự kiện: Khi Trạm nhận được ảnh từ ESP32
    ws.on('message', (data) => {
        // Broadcast: Phát bức ảnh đó cho TẤT CẢ các thiết bị đang kết nối
        wss.clients.forEach((client) => {
            // Không gửi ngược lại cho chính cái mạch ESP32 vừa ném ảnh lên
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    // Sự kiện: Khi mất kết nối
    ws.on('close', () => {
        console.log('connect fail, number of devices:', wss.clients.size);
    });
});