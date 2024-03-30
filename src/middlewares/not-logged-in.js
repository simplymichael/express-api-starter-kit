/**
 * Use to only allow actions when user is not logged in.
 * For example, registration and login routes will use this middleware
 */

const { apiErrorResponse } = require("../helpers/api-response");
const { statusCodes } = require("../helpers/http");

module.exports = notLoggedIn;

function notLoggedIn(req, res, next) {
  //if(req.session.user) {
  if(req.user) {
    const responseData = {
      error: apiErrorResponse({
        field: "user",
        message: "User is already logged in."
      }),
    };

    res.status(statusCodes.forbidden).json(responseData);
    return;
  } else {
    next();
  }
}
