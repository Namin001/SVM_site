const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      if (pathname === '/a') {
        await app.render(req, res, '/a', query);
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query);
      } else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`> Port ${port} is in use, trying ${parseInt(port) + 1}...`);
        process.env.PORT = parseInt(port) + 1;
        // In a real scenario we'd retry, but for this script we'll just advise the user
        console.error(`> Error: Port ${port} is already in use. Please run with a different port:`);
        console.error(`> Windows (PowerShell): $env:PORT=3005; node --inspect server.js`);
        console.error(`> Linux/Mac: PORT=3005 node --inspect server.js`);
        process.exit(1);
      } else {
        console.error(err);
        process.exit(1);
      }
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Mode: ${dev ? 'development' : 'production'}`);
    });
});
