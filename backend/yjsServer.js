const WebSocket = require('ws');
const http = require('http');
const wss = new WebSocket.Server({ noServer: true });
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('okay');
});

wss.on('connection', (conn, req) => {
    setupWSConnection(conn, req, { gc: true });
});

server.on('upgrade', (request, socket, head) => {
    // You may check auth of request here..
    // let { pathname } = parse(request.url);
    const handleAuth = (ws) => {
        wss.emit('connection', ws, request);
    };
    wss.handleUpgrade(request, socket, head, handleAuth);
});

server.listen(port, () => {
    console.log(`Yjs WebSocket server running at http://localhost:${port}`);
});
