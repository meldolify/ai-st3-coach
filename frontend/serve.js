// Simple static file server for frontend
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Strip query string and hash
  const urlPath = req.url.split('?')[0].split('#')[0];

  // Default to index.html
  let filePath = '.' + urlPath;
  if (filePath === './') {
    filePath = './index.html';
  }

  const serve = (resolvedPath) => {
    const ext = String(path.extname(resolvedPath)).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(resolvedPath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // Try .html fallback for extensionless paths (e.g. /simulation → /simulation.html)
          if (!ext && resolvedPath !== './index.html') {
            return serve(resolvedPath + '.html');
          }
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1>', 'utf-8');
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': mimeType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(content, 'utf-8');
      }
    });
  };

  serve(filePath);
});

server.listen(PORT, () => {
  console.log(`\u2713 Frontend server running at http://localhost:${PORT}/`);
  console.log(`\u2713 Open http://localhost:${PORT}/ in your browser`);
});
