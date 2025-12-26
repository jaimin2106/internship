const http = require('http');

const PORT = 3000;

http.createServer((req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    console.log('Client connected');

    // Send initial connection message
    sendEvent({ type: 'CONNECTED', message: 'Stream started' });

    // Simulate random machine alerts every 5 seconds
    const interval = setInterval(() => {
      const alertType = Math.random() > 0.5 ? 'CRITICAL' : 'WARNING';
      const machineId = Math.floor(Math.random() * 3) + 1;
      
      const event = {
        type: 'ALERT',
        data: {
          id: Date.now(),
          machineId,
          level: alertType,
          message: `${alertType}: Machine ${machineId} temperature spike detected`,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('Sending event:', event);
      sendEvent(event);
    }, 5000);

    req.on('close', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => {
  console.log(`SSE Server running at http://localhost:${PORT}/events`);
});
