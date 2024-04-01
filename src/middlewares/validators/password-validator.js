const { body } = require("express-validator");
const env = require("../../dotenv");

module.exports = () => {
  const MIN = env.PASSWORD_MIN_LENGTH;
  const MAX = env.PASSWORD_MAX_LENGTH;
  const SPECIAL_CHARS = env.PASSWORD_SPECIAL_CHARS.trim();
  const DISALLOWED_LIST = env.DISALLOWED_PASSWORDS.split(",").map(str => str.trim());

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
