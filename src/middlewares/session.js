const RedisStore      = require("connect-redis").default;
const session         = require("express-session");
const { v4: uuidv4 }  = require("uuid");
const env             = require("../../dotenv");
const diContainer     = require("../di-container");
const redisConnection = diContainer.resolve("redisConnection");

const environment = env.NODE_ENV.trim().toLowerCase();
const sessionConfig = {
  name: env.SESSION_NAME.trim() || "connect.sid",
  secret: env.SESSION_SECRET.trim(), // secret is needed to sign the cookie
  genid: () => uuidv4(), // generate a session ID.
  resave: false,
  saveUninitialized: false, // true initializes a session for unauthenticated users, false for only authenticated users
  rolling: true, // Force session identifier cookie (max-age) to be (re-)set on every response
  cookie: {
    domain   : env.SESSION_COOKIE_DOMAIN.trim(),
    httpOnly : true, // prevent client side JS from reading the cookie
    maxAge   : 1000 * 60 * Number(env.SESSION_EXPIRY.trim()), // session max age in miliseconds
    path     : env.SESSION_COOKIE_PATH.trim(),
    sameSite : "strict", // possible values: 'none', 'strict', 'lax'
    secure   : !(["development", "test"].includes(environment)), // if true, serve secure cookies (i.e., only transmit cookie over https)
  }
};

if(["production", "staging"].includes(environment)) {
  const redisClient = redisConnection;
  sessionConfig.store = new RedisStore({ client: redisClient });
}

module.exports = function sessionMiddleware() {
  return session(sessionConfig);
};
