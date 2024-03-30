const publicFields = require("./public-fields");

module.exports = {
  getPublicUserData,
  maskUserSensitiveData,
};

function getPublicUserData(user) {
  /*const safeUser = {};

  // Populate the user variable with values we want to return to the client
  publicFields.forEach(key => safeUser[key] = user[key]);


  return safeUser;
  */

  return maskUserSensitiveData(user);
}

function maskUserSensitiveData(user) {
  let protectedUser = {};

  for(const key of publicFields) {
    protectedUser[key] = user[key];
  }

  protectedUser.password = "*".repeat(10);

  return protectedUser;
}
