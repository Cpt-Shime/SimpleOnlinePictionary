// The server just relays the messages to all connected clients.
// For now he holds no information or does anything else.

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  //ws.send('Hello Server here');

  // On message receive
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // send whole message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});