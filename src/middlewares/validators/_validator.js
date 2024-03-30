const idValidator = require("./id-validator");
const firstnameValidator = require("./firstname-validator");
const lastnameValidator = require("./lastname-validator");
const emailValidator = require("./email-validator");
const passwordValidator = require("./password-validator");


const validators = {
  id              : idValidator,
  firstname       : firstnameValidator,
  lastname        : lastnameValidator,
  email           : emailValidator,
  password        : passwordValidator,
};

module.exports = {
  validate: (...args) => {
    const validations = [];

    args.forEach(arg => {
      const validator = validators[arg];

      if(validator) {
        validations.push(validator());
      }
    });

    return validations;
  },
};
