const express = require('express');
const http = require('http');
const WebSocket = require('ws'); // รับจาก Minecraft
const { Server } = require("socket.io"); // ส่งไปหน้าเว็บ

const app = express();
const server = http.createServer(app);

// ✅ เพิ่มส่วนนี้ครับ: สั่งให้หน้าแรกโชว์คำว่า "Server On"
app.get('/', (req, res) => {
    res.send('<h1 style="color:green; font-family:sans-serif;">✅ Server On (พร้อมทำงาน)</h1>');
});

// 1. ส่วนของหน้าเว็บ (ใช้ Socket.io)
const io = new Server(server, {
    cors: { origin: "*" } // อนุญาตให้เชื่อมต่อจากไหนก็ได้
});

// 2. ส่วนของ Minecraft (ใช้ WebSocket ที่ path: /mc)
const wss = new WebSocket.Server({ server, path: '/mc' });

// --- การทำงาน ---

// เมื่อ Minecraft เชื่อมต่อเข้ามา
wss.on('connection', (ws) => {
    console.log("⛏️ Minecraft เชื่อมต่อแล้ว!");

    // ส่งคำสั่งไปบอกเกม: "ส่งพิกัดมาเดี๋ยวนี้"
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

    // รอรับพิกัดที่เกมส่งกลับมา
    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            
            // ถ้าเป็นข้อมูลพิกัดการเดิน (PlayerTravelled)
            if (data.header.eventName === 'PlayerTravelled') {
                const position = data.body; // ได้ค่า x, y, z มาแล้ว
                
                // ส่งต่อไปให้หน้าเว็บทันที!
                io.emit('update_position', position);
            }
        } catch (e) {
            // กัน Error ถ้าข้อมูลที่ส่งมาไม่ใช่ JSON
        }
    });
});

// เมื่อหน้าเว็บเชื่อมต่อเข้ามา
io.on('connection', (socket) => {
    console.log("🌐 หน้าเว็บเชื่อมต่อแล้ว: " + socket.id);
    
    socket.on('join-voice', (userId) => {
        socket.broadcast.emit('user-joined', userId);
    });
});

// เริ่มรัน Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server พร้อมทำงานที่ Port: ${PORT}`);
});
        try {
            const data = JSON.parse(msg);
            
            // ถ้าเป็นข้อมูลพิกัดการเดิน (PlayerTravelled)
            if (data.header.eventName === 'PlayerTravelled') {
                const position = data.body; // ได้ค่า x, y, z มาแล้ว
                
                // ส่งต่อไปให้หน้าเว็บทันที! (เพื่อให้เว็บไปคำนวณเสียง)
                io.emit('update_position', position);
                
                // Log ดูเล่นๆ ว่าค่ามาไหม (ลบออกได้ถ้าเกรกะ)
                // console.log(`เดิน: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}`);
            }
        } catch (e) {
            // กัน Error ถ้าข้อมูลที่ส่งมาไม่ใช่ JSON
        }
    });
});

// เมื่อหน้าเว็บเชื่อมต่อเข้ามา
io.on('connection', (socket) => {
    console.log("🌐 หน้าเว็บเชื่อมต่อแล้ว: " + socket.id);
    
    // ตรงนี้เอาไว้จัดการเรื่องจับคู่เสียง (WebRTC signaling) ในอนาคต
    socket.on('join-voice', (userId) => {
        socket.broadcast.emit('user-joined', userId);
    });
});

// เริ่มรัน Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server พร้อมทำงานที่ Port: ${PORT}`);
});
