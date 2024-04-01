const env = require("../dotenv");
const { apiErrorResponse } = require("../helpers/api-response");
const {
  getAuthTokenFromAuthorizationHeader,
  getUserFromAuthToken
} = require("../helpers/auth");
const { statusCodes } = require("../helpers/http");

module.exports = auth;

async function auth(req, res, next) {
  const responseData = {
    error: apiErrorResponse({
      message: "Invalid access token.",
      field: "authorization token",
      location: "Authorization header"
    }),
  };

  try {
    const authString  = req.header("Authorization") || "";
    const bearerToken = getAuthTokenFromAuthorizationHeader(authString);

    if(!bearerToken) {
      return res.status(statusCodes.unauthorized).json(responseData);
    }

    const tokenSecret = env.AUTH_TOKEN_SECRET;
    const userService = req.app.resolve("UserService");
    const user = await getUserFromAuthToken(bearerToken, tokenSecret, userService);

    if(!user) {
      return res.status(statusCodes.unauthorized).json(responseData);
    }

    req.user = user;

    next();
  } catch(err) {
    if(err.name === "TokenExpiredError") {
      return res.status(statusCodes.unauthorized).json({
        error: apiErrorResponse({
          ...responseData.error,
          message: "Access token has expired."
        }),
      });
    }

    next(err);
  }
}
