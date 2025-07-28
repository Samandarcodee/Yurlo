// Vercel API function for Telegram Mini App
const { createServer } = require('../dist/server/node-build.mjs');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = createServer();
  }
  
  return app(req, res);
};
