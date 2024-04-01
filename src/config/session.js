const env = require("../dotenv");

const config = {
  session: {
    name         : env.SESSION_NAME,
    cookieDomain : env.SESSION_COOKIE_DOMAIN,
    cookiePath   : env.SESSION_COOKIE_PATH,
    expiry       : env.SESSION_EXPIRY,
    secret       : env.SESSION_SECRET
  },
};

module.exports = config;
