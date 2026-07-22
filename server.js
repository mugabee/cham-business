// Entry point for cPanel's "Setup Node.js App" (Phusion Passenger), which
// expects a startup file that listens on the port Passenger assigns via
// process.env.PORT — `next start` alone doesn't fit that model.
const { createServer } = require("http");
const path = require("path");

// Using next({ dev: false }) programmatically (instead of the `next start`
// CLI) skips Next's own automatic .env.local loading, and cPanel/LiteSpeed's
// .htaccess SetEnv block doesn't reach this process either -- so load it
// ourselves. (lib/db.ts and lib/mailer.ts also do this at their point of use,
// since Next runs request/action handling in separate worker processes that
// don't inherit whatever this top-level code sets.)
try {
  process.loadEnvFile(path.join(__dirname, ".env.local"));
} catch {
  // Fine if the file doesn't exist (e.g. env vars provided another way).
}

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
