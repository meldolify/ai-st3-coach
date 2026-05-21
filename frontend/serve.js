// Simple static file server for frontend
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Serve only files under this directory — never escape it.
const ROOT = path.resolve(__dirname);

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

/**
 * Resolve a URL path against ROOT and refuse anything that escapes it.
 * Decodes percent-escapes so attempts like `/%2e%2e/etc/passwd` are caught
 * before the fs.readFile call.
 */
function safeResolve(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null; // malformed percent-encoding
  }
  const resolved = path.resolve(ROOT, '.' + decoded);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return null;
  }
  return resolved;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Strip query string and hash
  const urlPath = req.url.split('?')[0].split('#')[0];

  // Default to index.html
  let filePath = safeResolve(urlPath === '/' ? '/index.html' : urlPath);
  if (filePath === null) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>', 'utf-8');
    return;
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
    // No file extension — try the exact path, then .html fallback, then SPA fallback.
    // filePath is already root-confined by safeResolve above.
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        // Exact path exists (e.g. directory or extensionless file)
        serveFile(filePath, 'application/octet-stream');
      } else {
        // Try .html fallback (e.g. /simulation → /simulation.html).
        // Appending a constant suffix to a root-confined path stays root-confined.
        const htmlPath = filePath + '.html';
        fs.access(htmlPath, fs.constants.F_OK, (err2) => {
          if (!err2) {
            serveFile(htmlPath, 'text/html');
          } else {
            // SPA fallback: serve index.html for React Router paths
            serveFile(path.join(ROOT, 'index.html'), 'text/html');
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
