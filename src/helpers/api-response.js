module.exports = {
  apiErrorResponse,
  apiSuccessResponse,
};


/**
 * @param {Object} errData
 * @param {String} message (required): The associated error message.
 * @param {String} field (required): The field that caused  or owns the error.
 * @param {String} value (optional): The current value of the field.
 *
 * @return {Object} with members:
 *   {Object|Array<Object>} error|errors
 *   {String} message
 *   {String} field
 */
function apiErrorResponse(errData) {
  const { message, field, value, ...rest } = errData;

  return { message, field, value, ...rest };
}

/**
 * @param {Object} data: the response data
 * @return {Object} with members:
 *   {Boolean} success
 *   {Object} data
 */
function apiSuccessResponse(data) {
  return {
    success: true,
    data,
  };
}
