const express = require('express');
const { WebSocketServer } = require('ws');
const axios = require('axios');
const { spawn } = require('child_process');

const app = express();
// Render bắt buộc dùng process.env.PORT
const PORT = process.env.PORT || 3000; 

// 1. GỌI PHẦN MỀM NABTO ĐỤC HẦM CHẠY NGẦM
console.log("Khởi động Nabto Tunnel...");
const nabtoProcess = spawn('./edge_tunnel_client', [
    '-p', 'pr-gjxcgx7k',  // Product ID của bạn
    '-d', 'de-dbhmhmzy',  // Device ID của bạn
    '--service', 'cam_stream',
    '--local-port', '8080'
]);

nabtoProcess.stdout.on('data', (data) => console.log(`[Nabto]: ${data}`));
nabtoProcess.stderr.on('data', (data) => console.error(`[Nabto Error]: ${data}`));

// 2. KHỞI TẠO WEBSOCKET ĐỂ NÉM VIDEO CHO WEB DASHBOARD
const server = app.listen(PORT, () => {
    console.log(`Relay Server đang chạy trên cổng ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
    console.log('Có Web Dashboard vừa kết nối vào xem Camera!');
    let isStreaming = true;

    while (isStreaming) {
        try {
            // Hút ảnh từ hầm Nabto ở cổng 8080
            const response = await axios.get(`http://127.0.0.1:8080/stream`, {
                responseType: 'arraybuffer',
                timeout: 1000
            });

            if (ws.readyState === ws.OPEN) {
                ws.send(`T:${Date.now()}`); 
                ws.send(response.data);
            } else {
                break;
            }
            await new Promise(r => setTimeout(r, 50)); // ~20 FPS
        } catch (error) {
            // Đợi 1s nếu rớt mạng rồi thử hút lại
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    ws.on('close', () => {
        console.log('Web Dashboard đã tắt Camera.');
        isStreaming = false;
    });
});