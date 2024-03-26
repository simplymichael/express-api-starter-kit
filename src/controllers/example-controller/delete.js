const { apiSuccessResponse } = require("../../helpers/api-response");
const { statusCodes } = require("../../helpers/http");

module.exports = deleteItem;

async function deleteItem(req, res) {
  res.status(statusCodes.ok).json(apiSuccessResponse({}));
}
