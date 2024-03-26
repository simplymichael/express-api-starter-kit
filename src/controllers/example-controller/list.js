const { apiSuccessResponse } = require("../../helpers/api-response");
const { statusCodes } = require("../../helpers/http");


module.exports = getItems;

async function getItems(req, res) {
  res.status(statusCodes.ok).json(apiSuccessResponse({}));
}
