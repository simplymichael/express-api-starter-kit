const path = require("node:path");
const env = require("../dotenv");

const config = {
  app: {
    name              : env.NAME.trim(),
    host              : env.HOST,
    port              : env.PORT,
    apiVersion        : env.API_VERSION,
    debugKey          : env.DEBUG_KEY,
    urlScheme         : env.URL_SCHEME.toLowerCase(),
    useWWW            : Number(env.USE_WWW) === 0 ? false : true,
    emailSenderDomain : env.EMAIL_SENDER_DOMAIN,
    environment       : env.NODE_ENV.trim().toLowerCase(),
    rootDir           : path.resolve(path.dirname(__dirname), "..").replace(/\\/g, "/"),
    allowedOrigins    : env.ALLOWED_ORIGINS.split(/[\s+,;]+/).map(o => o.trim()),
    authTokenSecret   : env.AUTH_TOKEN_SECRET,
    authTokenExpiry   : env.AUTH_TOKEN_EXPIRY,
    verificationCodeExpiry: 1000 * 60 * Number(env.VERIFICATION_CODE_EXPIRY),
    password: {
      minLength: env.PASSWORD_MIN_LENGTH,
      maxLength: env.PASSWORD_MAX_LENGTH,
      specialChars: env.PASSWORD_SPECIAL_CHARS.trim(),
      disallowedPasswords: env.DISALLOWED_PASSWORDS.split(",").map(str => str.trim()),
    },
  },
};


module.exports = config;
