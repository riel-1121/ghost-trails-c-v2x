import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

// Global error handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const server = http.createServer((req, res) => {
  // Log only in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Request received:', req.url);
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Serving file:', filePath);
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  } else if (req.url?.startsWith('/socket.io/')) {
    // Properly terminate Socket.IO polling
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end('{"code":1,"message":"Socket.IO not supported"}');
  } else if (req.url === '/favicon.ico') {
    // Handle favicon requests
    res.writeHead(204); // No Content
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, (err?: Error) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log('Server running on port 3000');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});