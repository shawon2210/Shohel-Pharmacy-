const app = require('../server/index');

// Vercel Node Functions expect (req, res) handler.
module.exports = (req, res) => {
  return app(req, res);
};

