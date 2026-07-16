// Entry point for cPanel's "Setup Node.js App" (Phusion Passenger), which
// expects a startup file that listens on the port Passenger assigns via
// process.env.PORT — `next start` alone doesn't fit that model.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
