const { makeValidEmail, makeValidSiteUrl, toTitleCase } = require("../helpers/string");

const company = {
  IDENTIFIERS: {
    name: "AiroFunds",
  },
  EMAILS: {
    support: {
      name: toTitleCase("Support"),
      email: makeValidEmail("support")
    },
  }
};

const nonceNamepsace = {
  EMAIL_VERIFICATION : "email-verification",
  PASSWORD_RESET     : "reset-password",
};

const notifications = {
  PASSWORD_RESET: {
    id: "password-reset",
    templateVars: {
      resetLink: makeValidSiteUrl("/password/reset?resetCode=:code:"),
      securityEmail: company.EMAILS.support.email,
    },
  },

  // Used for after-sign-up sending email verification email
  ACCOUNT_ACTIVATION: {
    id: "account-activation",
    templateVars: {
      companyName: company.IDENTIFIERS.name,
      confirmationLink: makeValidSiteUrl("/email/verify?verificationCode=:code:"),
      verificationLink: makeValidSiteUrl("/email/verify?verificationCode=:code:")
    },
  },

  ACCOUNT_ACTIVATION_EMAIL_RESEND: {
    id: "resend-verification-email",
    templateVars: {},
  },
};

const userRoles = {
  ADMIN : "admin",
  USER  : "user",
};

const userStatuses = {
  ACTIVE    : "active",
  BANNED    : "banned",
  DELETED   : "deleted",
  PENDING   : "pending",
  SUSPENDED : "suspended",
};


module.exports = {
  nonceNamepsace,
  notifications,
  userRoles,
  userStatuses,
};
