const { validationResult } = require("express-validator");
const { apiErrorResponse } = require("../helpers/api-response");
const { statusCodes }      = require("../helpers/http");


module.exports = checkExpressValidatorStatus;


function checkExpressValidatorStatus(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const responseArray = errors.array().map(err => apiErrorResponse({
      message: err.msg,
      field: err.path,
      type: err.type,
      location: err.location,
    }));

    return ( responseArray.length === 1
      ? res.status(statusCodes.badRequest).json({ error: responseArray[0] })
      : res.status(statusCodes.badRequest).json({ errors: responseArray })
    );


    // return res.status(statusCodes.badRequest).json({ errors: errors.array() });
  } else {
    next();
  }
}
