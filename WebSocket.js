"use strict";


const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
 
wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  console.log(ip);

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  ws.send('something');
});




