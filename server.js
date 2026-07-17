// Entry point for cPanel's "Setup Node.js App" (Phusion Passenger), which
// expects a startup file that listens on the port Passenger assigns via
// process.env.PORT — `next start` alone doesn't fit that model.
const { createServer } = require("http");
const fs = require("fs");
const path = require("path");
const next = require("next");

const logFile = path.join(__dirname, "app-debug.log");
function logError(label, err) {
  const entry = `[${new Date().toISOString()}] ${label}: ${err && err.stack ? err.stack : err}\n`;
  fs.appendFileSync(logFile, entry);
}

process.on("uncaughtException", (err) => logError("uncaughtException", err));
process.on("unhandledRejection", (err) => logError("unhandledRejection", err));

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    fs.appendFileSync(
      logFile,
      `[${new Date().toISOString()}] incoming ${req.method} ${req.url}\n`
    );
    res.on("finish", () => {
      fs.appendFileSync(
        logFile,
        `[${new Date().toISOString()}] finished ${req.method} ${req.url} -> ${res.statusCode}\n`
      );
    });
    handle(req, res).catch((err) => {
      logError(`request ${req.method} ${req.url}`, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
  }).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
