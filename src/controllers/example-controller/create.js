const { apiSuccessResponse } = require("../../helpers/api-response");
const { statusCodes } = require("../../helpers/http");

module.exports = create;

async function create(req, res) {
  res.status(statusCodes.ok).json(apiSuccessResponse({}));
}
