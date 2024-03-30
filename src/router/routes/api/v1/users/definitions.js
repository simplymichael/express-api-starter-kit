const diContainer = require("../../../../../di-container");
const authorized = require("../../../../../middlewares/auth");
const loadUser = require("../../../../../middlewares/load-user");
const loggedIn = require("../../../../../middlewares/logged-in");
const notLoggedIn = require("../../../../../middlewares/not-logged-in");
const restrictUserToSelf = require("../../../../../middlewares/restrict-user-to-self");
const validator = require("../../../../../middlewares/validators/_validator");
const checkExpressValidatorStatus = require("../../../../../middlewares/express-validator-status-checker");

const userController = diContainer.resolve("userController");
const injectDiContainerMiddleware = (req, res, next) => {
  req.diContainer = diContainer;
  next();
};


module.exports = {
  authenticate: {
    // This route must come before the getUser route,
    // otherwise, the /auth will be interpreted as the :userId parameter
    // of the getUser route.
    method     : "POST",
    path       : "/auth",
    parameters : [],
    middleware : [injectDiContainerMiddleware, authorized],
    controller : userController.authenticate.bind(userController),
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
    middleware : [injectDiContainerMiddleware],
    controller : userController.search.bind(userController),
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
    middleware : [injectDiContainerMiddleware, loadUser],
    controller : userController.resendVerificationEmail.bind(userController),
    description: "Re-send verification email"
  },
  getUser: {
    method     : "GET",
    path       : "/",
    parameters : [":userId"],
    middleware : [injectDiContainerMiddleware],
    controller : userController.getUser.bind(userController),
    description: "Get details of user specified by their id"
  },
  verifyEmail: {
    method     : "GET",
    path       : "/email/verify",
    parameters : [],
    middleware : [injectDiContainerMiddleware],
    controller : userController.verifyUserEmail.bind(userController),
    description: "Verify user email after signup"
  },
  listUsers: {
    method     : "GET",
    path       : "/",
    parameters : [],
    middleware : [injectDiContainerMiddleware],
    controller : userController.list.bind(userController),
    description: "Fetch list of registered users"
  },
  signup: {
    method     : "POST",
    path       : "/",
    parameters : [],
    middleware : [
      injectDiContainerMiddleware,
      loadUser,
      notLoggedIn,
      validator.validate("firstname", "lastname", "email", "password"),
      checkExpressValidatorStatus
    ],
    controller : userController.createUser.bind(userController),
    description: "Register (create) a new user"
  },
  login: {
    method     : "POST",
    path       : "/login",
    parameters : [],
    middleware : [
      injectDiContainerMiddleware,
      loadUser,
      notLoggedIn,
      validator.validate("email", "password"),
      checkExpressValidatorStatus
    ],
    controller : userController.login.bind(userController),
    description: "Log user in"
  },
  logout: {
    method     : "GET",
    path       : "/logout",
    parameters : [],
    middleware : [injectDiContainerMiddleware],
    controller : userController.logout.bind(userController),
    description: "Logout a signed-in user"
  },
  forgotPassword: {
    method     : "POST",
    path       : "/password/forgot",
    parameters : [],
    middleware : [injectDiContainerMiddleware],
    controller : userController.forgotPasswordHandler.bind(userController),
    description: "Notify the app that a user has forgotten their password"
  },
  resetPassword: {
    method     : "POST",
    path       : "/password/reset",
    parameters : [],
    middleware : [
      injectDiContainerMiddleware,
      validator.validate("password"),
      checkExpressValidatorStatus
    ],
    controller : userController.resetPassword.bind(userController),
    description: "Reset user password"
  },
  updateUser: {
    method     : "PUT",
    path       : "/",
    parameters : [],
    middleware : [
      injectDiContainerMiddleware,
      loadUser,
      loggedIn,
      authorized,
      restrictUserToSelf,
      validator.validate("id", "firstname", "lastname", "email"),
      checkExpressValidatorStatus
    ],
    controller : userController.updateUser.bind(userController),
    description: "Update user details (firstname, lastname, email)"
  },
  deleteUser: {
    method     : "DELETE",
    path       : "/",
    parameters : [":userId"],
    middleware : [injectDiContainerMiddleware, loadUser, loggedIn, authorized],
    controller : userController.deleteUser.bind(userController),
    description: "Delete user from the database"
  }
};
