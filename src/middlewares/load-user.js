const config = require("../config");
const {
  getAuthTokenFromAuthorizationHeader,
  getUserFromAuthToken
} = require("../helpers/auth");

module.exports = loadUser;

async function loadUser(req, res, next) {
  try {
    const tokenSecret = config.app.authTokenSecret;
    const authString  = req.header("Authorization") || "";
    const bearerToken = getAuthTokenFromAuthorizationHeader(authString);
    const userService = req.app.resolve("userService");
    const user = await getUserFromAuthToken(bearerToken, tokenSecret, userService);

    req.user = user;

    next();
  } catch(err) {
    req.user = null;

    next();
  }
}
