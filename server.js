// --- server.js (ฉบับสมบูรณ์ 100%) ---
const express = require('express');        // บรรทัดนี้ห้ามหาย!
const http = require('http');
const WebSocket = require('ws');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ ส่วนนี้คือหน้าต้อนรับ (แก้ Cannot GET /)
app.get('/', (req, res) => {
    res.send('<h1 style="color:green; font-family:sans-serif;">✅ Server On (พร้อมทำงาน)</h1>');
});

// 1. ตั้งค่า Socket.io (สำหรับหน้าเว็บ)
const io = new Server(server, {
    cors: { origin: "*" }
});

// 2. ตั้งค่า WebSocket (สำหรับ Minecraft)
const wss = new WebSocket.Server({ server, path: '/mc' });

// --- ส่วนการทำงาน ---

// เมื่อ Minecraft เชื่อมต่อเข้ามา
wss.on('connection', (ws) => {
    console.log("⛏️ Minecraft Connected!");

    // สั่งให้เกมส่งพิกัด
    const command = {
        header: {
            version: 1,
            requestId: "uuid-1",
            messagePurpose: "subscribe",
            messageType: "commandRequest"
        },
        body: { eventName: "PlayerTravelled" }
    };
    ws.send(JSON.stringify(command));

    // รับพิกัดจากเกม
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            if (data.header.eventName === 'PlayerTravelled') {
                const position = data.body;
                // ส่งต่อให้หน้าเว็บ
                io.emit('update_position', position);
            }
        } catch (e) {}
    });
});

// เมื่อหน้าเว็บเชื่อมต่อเข้ามา
io.on('connection', (socket) => {
    console.log("🌐 Web Connected: " + socket.id);
    
    socket.on('join-voice', (userId) => {
        socket.broadcast.emit('user-joined', userId);
    });
});

// เริ่มรัน Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
