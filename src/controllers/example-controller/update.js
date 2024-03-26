const { apiSuccessResponse } = require("../../helpers/api-response");
const { statusCodes } = require("../../helpers/http");


module.exports = updateItem;

async function updateItem(req, res) {
  res.status(statusCodes.ok).json(apiSuccessResponse({}));
}
