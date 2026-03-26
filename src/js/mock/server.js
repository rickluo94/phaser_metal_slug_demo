const express = require('express');

const app = express();
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
    console.log('WebSocket connected');

    // 監聽前端傳來的訊息
    ws.on('message', (message) => {
        console.log('Received message from client:', message);

        // 回覆訊息給前端
        ws.send('Hello from WebSocket server!');
    });

    // 監聽 WebSocket 關閉事件
    ws.on('close', () => {
        console.log('WebSocket disconnected');
    });
});

// 啟動 Express 伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
