let authMiddleware;

try {
  authMiddleware = require("./authMiddleware");
} catch (err) {
  authMiddleware = require("./authMIddleware");
}

module.exports = authMiddleware;
