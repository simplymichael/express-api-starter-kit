const { body } = require("express-validator");
const config = require("../../config");

module.exports = () => {
  const MIN = config.app.password.minLength;
  const MAX = config.app.password.maxLength;
  const SPECIAL_CHARS = config.app.password.specialChars;
  const DISALLOWED_LIST = config.app.password.disallowedPasswords;

  return [
    body("password").trim()
      .isLength({
        min: MIN,
        max: MAX
      }).withMessage(`The password must be between ${MIN} and ${MAX} characters long`)
      .matches(/\d/).withMessage("The password must contain a number")
      .matches(/[A-Z]+/).withMessage("The password must contain an uppercase character")
      .matches(/[a-z]+/).withMessage("The password must contain a lowercase character")
      .matches(new RegExp(`[${SPECIAL_CHARS}]+`)).withMessage("The password must contain a special character")
      .not().isIn(DISALLOWED_LIST).withMessage("Do not use a common word as the password")
      .escape()
  ];
};
