const diContainer = require("../../../../../di-container");
const authorized = require("../../../../../middlewares/auth");
const loadUser = require("../../../../../middlewares/load-user");
const loggedIn = require("../../../../../middlewares/logged-in");
const notLoggedIn = require("../../../../../middlewares/not-logged-in");
const restrictUserToSelf = require("../../../../../middlewares/restrict-user-to-self");
const validator = require("../../../../../middlewares/validators/_validator");
const checkExpressValidatorStatus = require("../../../../../middlewares/express-validator-status-checker");

const userController = diContainer.resolve("userController");


module.exports = {
  authenticate: {
    // This route must come before the getUser route,
    // otherwise, the /auth will be interpreted as the :userId parameter
    // of the getUser route.
    method     : "POST",
    path       : "/auth",
    parameters : [],
    middleware : [authorized],
    handler    : userController.authenticate.bind(userController),
    description: "Authenticate a user using their access token (Authorization header Bearer token) credentials. " +
    "Useful for external services trying to authenticate a user before giving them access to protected operations."
  },
  searchUsers: {
    // This route must come before the getUser route,
    // otherwise, the /search will be interpreted as the :userId parameter
    // of the getUser route.
    method     : "GET",
    path       : "/search",
    parameters : [],
    middleware : [],
    handler    : userController.search.bind(userController),
    description: "Search for users by firstname, lastname, email"
  },
  resendVerificationEmail: {
    // This route must come before the getUser route,
    // otherwise, the /resend-verification-email
    // will be interpreted as the :userId parameter
    // of the getUser route.
    method     : "GET",
    path       : "/resend-verification-email",
    parameters : [],
    middleware : [loadUser],
    handler    : userController.resendVerificationEmail.bind(userController),
    description: "Re-send verification email"
  },
  getUser: {
    method     : "GET",
    path       : "/",
    parameters : [":userId"],
    middleware : [],
    handler    : userController.getUser.bind(userController),
    description: "Get details of user specified by their id"
  },
  verifyEmail: {
    method     : "GET",
    path       : "/email/verify",
    parameters : [],
    middleware : [],
    handler    : userController.verifyUserEmail.bind(userController),
    description: "Verify user email after signup"
  },
  listUsers: {
    method     : "GET",
    path       : "/",
    parameters : [],
    middleware : [],
    handler    : userController.list.bind(userController),
    description: "Fetch list of registered users"
  },
  signup: {
    method     : "POST",
    path       : "/",
    parameters : [],
    middleware : [
      loadUser,
      notLoggedIn,
      validator.validate("firstname", "lastname", "email", "password"),
      checkExpressValidatorStatus
    ],
    handler    : userController.createUser.bind(userController),
    description: "Register (create) a new user"
  },
  login: {
    method     : "POST",
    path       : "/login",
    parameters : [],
    middleware : [
      loadUser,
      notLoggedIn,
      validator.validate("email", "password"),
      checkExpressValidatorStatus
    ],
    handler    : userController.login.bind(userController),
    description: "Log user in"
  },
  logout: {
    method     : "GET",
    path       : "/logout",
    parameters : [],
    middleware : [],
    handler    : userController.logout.bind(userController),
    description: "Logout a signed-in user"
  },
  forgotPassword: {
    method     : "POST",
    path       : "/password/forgot",
    parameters : [],
    middleware : [],
    handler    : userController.forgotPasswordHandler.bind(userController),
    description: "Notify the app that a user has forgotten their password"
  },
  resetPassword: {
    method     : "POST",
    path       : "/password/reset",
    parameters : [],
    middleware : [
      validator.validate("password"),
      checkExpressValidatorStatus
    ],
    handler    : userController.resetPassword.bind(userController),
    description: "Reset user password"
  },
  updateUser: {
    method     : "PUT",
    path       : "/",
    parameters : [],
    middleware : [
      loadUser,
      loggedIn,
      authorized,
      restrictUserToSelf,
      validator.validate("id", "firstname", "lastname", "email"),
      checkExpressValidatorStatus
    ],
    handler    : userController.updateUser.bind(userController),
    description: "Update user details (firstname, lastname, email)"
  },
  deleteUser: {
    method     : "DELETE",
    path       : "/",
    parameters : [":userId"],
    middleware : [loadUser, loggedIn, authorized],
    handler    : userController.deleteUser.bind(userController),
    description: "Delete user from the database"
  }
};
