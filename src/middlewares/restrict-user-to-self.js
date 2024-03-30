const { apiErrorResponse } = require("../helpers/api-response");
const { statusCodes } = require("../helpers/http");

/**
 * Lets a user only perform actions on their own profiles,
 * not other users'
 */
function restrictUserToSelf(req, res, next) {
  //if(!req.session.user || (req.session.user.id !== req.body.id))
  if(!req.user || (req.user.id !== req.body.id)) {
    const responseData = {
      error: apiErrorResponse({
        field: "user",
        message: "Only the account owner is authorized to perform this operation",
      }),
    };

    return res.status(statusCodes.unauthorized).json(responseData);
  } else {
    next();
  }
}

module.exports = restrictUserToSelf;
