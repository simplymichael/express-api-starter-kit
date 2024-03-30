const env = require("../../dotenv");
const {
  getAuthTokenFromAuthorizationHeader,
  getUserFromAuthToken
} = require("../helpers/auth");

module.exports = loadUser;

async function loadUser(req, res, next) {
  try {
    const tokenSecret = env.AUTH_TOKEN_SECRET;
    const authString  = req.header("Authorization") || "";
    const bearerToken = getAuthTokenFromAuthorizationHeader(authString);
    const userService = req.diContainer.resolve("userService");
    const user = await getUserFromAuthToken(bearerToken, tokenSecret, userService);

    req.user = user;

    next();
  } catch(err) {
    req.user = null;

    next();
  }
}
