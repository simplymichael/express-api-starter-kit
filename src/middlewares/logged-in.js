const { apiErrorResponse } = require("../helpers/api-response");
const { statusCodes } = require("../helpers/http");

module.exports = loggedIn;

function loggedIn(req, res, next) {
  //if (!req.session.user) {
  if(!req.user) {
    const responseData = {
      error: apiErrorResponse({
        field: "user",
        message: "Please log in first."
      }),
    };

    return res.status(statusCodes.forbidden).json(responseData);
  } else {
    next();
  }
}
