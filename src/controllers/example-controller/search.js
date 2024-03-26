const { apiSuccessResponse } = require("../../helpers/api-response");
const { statusCodes } = require("../../helpers/http");

module.exports = searchItems;


async function searchItems(req, res) {
  res.status(statusCodes.ok).json(apiSuccessResponse({}));
  return;
}
