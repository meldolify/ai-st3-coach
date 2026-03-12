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

  const ext = String(path.extname(filePath)).toLowerCase();

  const serveFile = (resolvedPath, mimeType) => {
    fs.readFile(resolvedPath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
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

  if (ext) {
    // Has file extension — serve directly (assets: .js, .css, .png, etc.)
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    serveFile(filePath, mimeType);
  } else {
    // No file extension — try the exact path, then .html fallback, then SPA fallback
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        // Exact path exists (e.g. directory or extensionless file)
        serveFile(filePath, 'application/octet-stream');
      } else {
        // Try .html fallback (e.g. /simulation → /simulation.html)
        const htmlPath = filePath + '.html';
        fs.access(htmlPath, fs.constants.F_OK, (err2) => {
          if (!err2) {
            serveFile(htmlPath, 'text/html');
          } else {
            // SPA fallback: serve index.html for React Router paths
            serveFile('./index.html', 'text/html');
          }
        });
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`\u2713 Frontend server running at http://localhost:${PORT}/`);
  console.log(`\u2713 Open http://localhost:${PORT}/ in your browser`);
});
