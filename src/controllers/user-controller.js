const config = require("../config");
const constants = require("../constants");
const { apiErrorResponse, apiSuccessResponse } = require("../helpers/api-response");
const { checkPassword, generateAuthToken, hashPassword } = require("../helpers/auth");
const { statusCodes }  = require("../helpers/http");
const { getPublicUserData } = require("../helpers/security");
const userVerification = require("../helpers/user-verification");


class UserController {
  #logger = null;
  #notificationService = null;
  #userService = null;

  constructor({ logger, notificationService, userService }) {
    this.#logger = logger;
    this.#notificationService = notificationService;
    this.#userService = userService;
  }

  async authenticate(req, res) {
    const logger = this.#logger;
    const user = req.user; // coming from the authorize middleware

    const authenticatedUser = getPublicUserData(user);

    logger.log(
      "info",
      `User authentication successful for user: "${user.id}".`
    );

    res.status(statusCodes.ok).json(apiSuccessResponse({ user: authenticatedUser }));
    return;
  }

  /**
   * Create (i.e, register) a new user
   * Every newly created/registered user will be have a role of "user"
   * and their status will be "pending"
   * until they click on the verification link in the
   * successful registration email.
   */
  async createUser(req, res) {
    let responseData;
    const logger = this.#logger;
    const notificationService = this.#notificationService;
    const userService = this.#userService;
    const { firstname, lastname, email, password } = req.body;

    if(await userService.findByEmail(email)) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : email,
          location : "request body",
          message  : "The given email address is not available.",
          field    : "email"
        }),
      };

      logger.log("info", `Unable to create user because email '${email}' already exists`);

      res.status(statusCodes.conflict).json(responseData);
      return;
    }

    const hashedPassword = await hashPassword(password);
    const data = await userService.createUser({
      firstname,
      lastname,
      email,
      password : hashedPassword,
      role     : constants.userRoles.USER,
      status   : constants.userStatuses.PENDING,
    });

    const user = getPublicUserData(data);
    const nonceService = getNonceService(req);
    const nonce = await userVerification.createNonce(user, null, nonceService);

    // user.nonce = nonce;

    // Enqueue, so that the queue can create a user welcome message
    // with a verify email link.
    // await enqueue(constants.queues.POST_SIGNUP, serializer.serialize(user));
    //
    // Now, rather than use a queue, we use a notification service,
    // In the future, if we wish,
    // we can have the notification service enqueue the post-signup message.
    // This is also why we commented out the user.nonce part,
    // which would have been sent with the data to the queue
    // so it can be added to the email variables.
    // But now, we can add it directly here.
    //
    // Although sendConfirmationLink is an async method,
    // we don't `await` it as we don't need its return value for anything.
    // We just fire and forget. That way, we don't block the (main) thread.
    notificationService.sendConfirmationLink(user, nonce);

    res.status(statusCodes.created).json(apiSuccessResponse({ user }));
    return;
  }

  async deleteUser(req, res) {
    let responseData;
    const userService = this.#userService;

    if(!req.params.userId || !req.body.userId) {
      responseData = {
        error: apiErrorResponse({
          message: "The user id must be specified in the request url and request body!",
          field: "userId",
          location: "request parameter | request body"
        }),
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    // We are doing this to make it difficult to delete a user.
    // That way, deleting a user means we really want to do it
    // and not by mistake.
    if(req.params.userId.toString() !== req.body.userId.toString()) {
      responseData = {
        error: apiErrorResponse({
          message: "The user id must be specified in the request url and request body.",
          field: "userId",
          location: "request parameter | request body"
        }),
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    const { userId } = req.body;
    const userData = await userService.findById(userId);

    if(!userData) {
      responseData = {
        error: apiErrorResponse({
          message: "User not found.",
          field: "userId",
          location: "request parameter | request body"
        }),
      };

      res.status(statusCodes.notFound).json(responseData);
      return;
    }

    await userService.deleteUser(userId);

    /**
     * If a user is deleting their own account,
     * this should happen in cases where it is not an admin user
     * that is deleting another user.
     * In such cases, once the user deletes their account, we log them out.
     */
    /*if(req.session.user.id === userId) {
      req.session.user = null; // Kill the user's session
    }*/

    res.status(statusCodes.ok).json(apiSuccessResponse({}));
    return;
  }

  async forgotPasswordHandler(req, res) {
    let responseData;
    const notificationService = this.#notificationService;
    const userService = this.#userService;
    const userEmail = req.body?.email?.trim();

    if(!userEmail) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : userEmail,
          location : "request body",
          message  : "The email field is required.",
          field    : "email"
        }),
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    const user = await userService.findByEmail(userEmail);

    if(user) {
      const serializableUser = getPublicUserData(user);
      const namespace = constants.nonceNamepsace.PASSWORD_RESET;
      const nonceService = getNonceService(req);
      const nonce = await userVerification.createNonce(serializableUser, namespace, nonceService);

      notificationService.sendPasswordResetLink(serializableUser, nonce);
    }

    res.status(statusCodes.ok).json(apiSuccessResponse({}));
    //await clearCSRFToken(req);
    return;
  }

  async getUser(req, res) {
    let responseData;
    const logger = this.#logger;
    const userService = this.#userService;
    const userId = req.params.userId;

    try {
      const userData = await userService.findById(userId);

      if(!userData) {
        responseData = {
          error: apiErrorResponse({
            type     : "request parameter",
            value    : userId,
            location : "url parameter",
            message  : "No user with the given id exists.",
            field    : "userId"
          }),
        };

        logger.log("error", `Getting user data failed for user ${userId}`);

        res.status(statusCodes.notFound).json(responseData);
        return;
      }

      const user = getPublicUserData(userData);

      logger.log("info", `Getting user data for user ${userId} successful`);

      res.status(statusCodes.ok).json(apiSuccessResponse({ user }));
      return;
    } catch(e) {
      responseData = {
        error: apiErrorResponse({
          type     : "request parameter",
          value    : userId,
          location : "url parameter",
          message  : "No user with the given id exists.",
          field    : "userId"
        }),
      };

      logger.log("error", `Getting user data failed for reason ${e}`);

      res.status(statusCodes.notFound).json(responseData);
    }
  }

  /* GET users listing. */
  async list(req, res) {
    let responseData;
    const logger = this.#logger;
    const userService = this.#userService;
    const results = await userService.findMany({ query: req.query });
    const users = results.users.map(user => getPublicUserData(user));

    responseData = apiSuccessResponse({
      total: results.total,
      length: results.length,
      users,
    });

    logger.log("info", "Successfully fetched users list");

    res.status(statusCodes.ok).json(responseData);
  }

  async login(req, res) {
    let responseData;
    const logger = this.#logger;
    const userService = this.#userService;
    const { email, password } = req.body;
    const userData = await userService.findByEmail(email);

    if(!userData) {
      responseData = {
        error: apiErrorResponse({
          message  : "User not found.",
          field    : "email",
          location : "request body",
          value    : email
        }),
      };

      logger.log("info", `Could not login user. Reason: No user with specified email '${email}' found.`);

      res.status(statusCodes.notFound).json(responseData);
      return;
    }

    if(!(await checkPassword(password, userData.password))) {
      responseData = {
        error: apiErrorResponse({
          message  : "The email or password you have provided do not match our records",
          field    : "password",
          location : "request body"
        })
      };

      logger.log("info", `Could not login user with email '${email}'. Reason: Invalid password.`);

      res.status(statusCodes.notFound).json(responseData);
      return;
    }

    const us = constants.userStatuses;

    if([us.BANNED, us.SUSPENDED].includes(userData.status)) {
      responseData = {
        error: apiErrorResponse({
          message: `Operation not allowed. This account has been ${userData.status}`,
          field: "email",
          location: "request body"
        }),
      };

      logger.log(
        "info",
        `User login denied for user with email '${email}'. Reason: User account is ${userData.status}.`
      );

      res.status(statusCodes.forbidden).json(responseData);
      return;
    }

    const user = getPublicUserData(userData);

    // req.session.user = user; // Maintain the user's data in current session

    // Create an auth token for the user so we can validate future requests
    const tokenSecret = config.app.authTokenSecret;
    const tokenExpiry = config.app.authTokenExpiry;
    const { token, expiry } = generateAuthToken(
      user.id, user.email, tokenSecret, eval(tokenExpiry) + "s"
    );
    const authorization = { token: `Bearer ${token}`, expiresIn: expiry };

    logger.log("info", `Login successful for user with email '${email}'.`);

    res.status(statusCodes.ok).json(apiSuccessResponse({ user,  authorization }));
    return;
  }

  async logout(req, res) {
    // req.session.destroy();

    return res.status(statusCodes.ok).json(apiSuccessResponse({}));
  }

  async resendVerificationEmail(req, res) {
    let responseData;
    const notificationService = this.#notificationService;
    // const user = req.session.user;
    const user = req.user;

    if(!user) {
      responseData = {
        error: apiErrorResponse({
          location : "Authorization header",
          message  : "User is not logged in."
        })
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    if(user.status !== constants.userStatuses.PENDING) {
      responseData = {
        error: apiErrorResponse({
          location: "Authorization header",
          message: "The account has already been verified.",
        }),
      };

      res.status(statusCodes.conflict).json(responseData);
      return;
    }

    const nonceService = getNonceService(req);
    const serializableUser = getPublicUserData(user);
    const nonce = await userVerification.createNonce(serializableUser, null, nonceService);

    // See the section sending the verification email to users after signup
    // for explanations regarding our use of this method.
    notificationService.resendConfirmationLink(user, nonce);

    res.status(statusCodes.ok).json(apiSuccessResponse({ user: serializableUser }));
    return;
  }

  async resetPassword(req, res) {
    let responseData;
    const logger = this.#logger;
    const userService = this.#userService;
    const data        = req.body || {};
    const newPassword = data.password?.trim();
    const nonce       = data.resetCode?.trim();

    if(!newPassword) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : newPassword,
          location : "request body",
          message  : "The password field is required.",
          field    : "password"
        }),
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    if(!nonce) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : nonce,
          location : "request body",
          message  : "Missing reset code.",
          field    : "resetCode"
        }),
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    const namespace = constants.nonceNamepsace.PASSWORD_RESET;
    const nonceService = getNonceService(req);
    const user      = await userVerification.verifyNonce(nonce, namespace, nonceService);

    if(!user?.id) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : nonce,
          location : "request body",
          message  : "The reset code is invalid or has expired.",
          field    : "resetCode"
        }),
      };

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    //await userVerification.deleteNonce(nonce, namespace);

    const fetchedUser = await userService.findById(user.id);
    const userStatus  = fetchedUser?.status;
    const us = constants.userStatuses;

    if([us.SUSPENDED, us.BANNED].includes(userStatus)) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : nonce,
          location : "body",
          message  : `Operation not allowed. This account has been ${userStatus}.`,
          field    : "resetCode"
        }),
      };

      logger.log(
        "info",
        `Failed to reset password for user '${fetchedUser.id}' because the user is currently ${userStatus}`
      );

      res.status(statusCodes.forbidden).json(responseData);
      return;
    }

    const hashedPassword = await hashPassword(newPassword);
    const updateData = { password: hashedPassword };
    const updatedUser = await userService.updateUser(fetchedUser.id, updateData);

    const returnUser = getPublicUserData(updatedUser);

    res.status(statusCodes.created).json(apiSuccessResponse({ user: returnUser }));
    // await clearCSRFToken(req);
    return;
  }

  /* Search for users */
  async search(req, res) {
    res.status(statusCodes.ok).json(apiSuccessResponse({}));
    return;
  }

  /* Update user */
  async updateUser(req, res) {
    let responseData;
    const logger = this.#logger;
    const userService = this.#userService;
    const { id, firstname, lastname, email } = req.body;
    const userData = await userService.findById(id);

    if(!userData) {
      responseData = {
        error: apiErrorResponse({
          message  : "User not found.",
          field    : "id",
          location : "request body",
          value    : id
        }),
      };

      res.status(statusCodes.notFound).json(responseData);
      return;
    }

    await userService.updateUser(id, { firstname, lastname, email });

    const updatedUser = await userService.findById(id);
    const user = getPublicUserData(updatedUser);

    logger.log(
      "info",
      `updated data for user '${user.id}' from ${getPublicUserData(userData)} to ${user}`
    );

    res.status(statusCodes.ok).json(apiSuccessResponse({ user }));
    return;
  }

  async verifyUserEmail(req, res) {
    let responseData;
    const logger = this.#logger;
    const userService = this.#userService;
    const verificationCode = req.query.verificationCode;

    if(!verificationCode) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : verificationCode,
          location : "query string",
          message  : "The verification code query string is required.",
          field    : "verificationCode"
        }),
      };

      logger.log("info", "Could not verify user. Reason: no verification code supplied.");

      res.status(statusCodes.badRequest).json(responseData);
      return;
    }

    try {
      // When they click on the link in their email, it comes here
      // with the nonce query string attached. So, we try to verify them.
      const nonceService = getNonceService(req);
      const user = await userVerification.verifyNonce(verificationCode, null, nonceService);

      if(!user?.id) {
        responseData = {
          error: apiErrorResponse({
            type     : "field",
            value    : verificationCode,
            location : "query string",
            message  : "The verification code has expired.",
            field    : "verificationCode"
          }),
        };

        logger.log(
          "info",
          `Could not verify user with id '${user?.id}'. Reason: verification code has expired.`
        );

        res.status(statusCodes.badRequest).json(responseData);
        return;
      }

      const storedUser = await userService.findById(user.id);

      // We are checking against pending, rather than active ( === "active"),
      // incase the user is suspended or deleted, a check for active (=== "active")
      // will give a false positive and make us reactivate a suspended or deleted
      // user just because they clicked on the link to request email verification.
      if(storedUser && storedUser.status !== constants.userStatuses.PENDING) {
        responseData = {
          error: apiErrorResponse({
            type     : "field",
            value    : verificationCode,
            location : "query string",
            message  : "The account has already been verified.",
            field    : "verificationCode"
          }),
        };

        logger.log(
          "info",
          `Could not re-verify user with id '${user.id}'. Reason: account has already been verified.`
        );

        res.status(statusCodes.conflict).json(responseData);
        return;
      }

      const updateData = { status: constants.userStatuses.ACTIVE };
      const data = await userService.updateUser(storedUser.id, updateData);

      const returnUser = getPublicUserData(data);

      logger.log("info", `User with id '${returnUser.id}' verified successfully`);

      res.status(statusCodes.ok).json(apiSuccessResponse({ user: returnUser }));
      return;
    } catch(e) {
      responseData = {
        error: apiErrorResponse({
          type     : "field",
          value    : verificationCode,
          location : "query string",
          message  : "Could not verify user.",
          field    : "code"
        }),
      };

      logger.log("error", `Could not verify user due to error: ${e}`);

      res.status(statusCodes.serverError).json(responseData);
      return;
    }
  }
}


module.exports = UserController;


// Helper functions
function getNonceService(req) {
  return req.app.resolve("nonceService");
}
