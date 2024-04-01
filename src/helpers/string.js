const emailValidator = require("email-validator");
const env = require("../dotenv");

const { NAME, HOST, PORT, URL_SCHEME, USE_WWW, EMAIL_SENDER_DOMAIN } = env;
let scheme = URL_SCHEME.toLowerCase();
const apiVersion = env.API_VERSION;

// if(!(["http", "https", "http://", "https://"].includes(scheme)))
if(!(/^https?(:\/\/)?/.test(scheme))) {
  scheme = "http://";
}

scheme = scheme.split(/:\/\//)[0] + "://";

const httpRegex  = /^https?:\/\//i;
const prefixHost = Number(USE_WWW) === 0 ? HOST : `www.${HOST}`;
const host  = (httpRegex.test(prefixHost)) ? prefixHost : `${scheme}${prefixHost}`;
const port  = [80, 443].includes(Number(PORT)) ? "" : PORT;
const baseUrl = port ? `${host}:${port}` : host;

module.exports = {
  isEmail,
  makeValidEmail,
  makeValidEmailSenderName,
  makeValidSiteUrl,
  toTitleCase,
};


function isEmail(email) {
  return emailValidator.validate(email);
}

// Auto-append our site domain to an email address,
// so that we don't have to fill out the full email
// inside the constants.COMPANY.emails.
// But we also want to allow for the flexibility
// of completely filling it in, for example, in cases where we
// want a different domain name prefix to the email.
function makeValidEmail(email, emailSuffixUrl = EMAIL_SENDER_DOMAIN) {
  if(!isEmail(email)) {
    email = `${email.split("@")[0]}@${emailSuffixUrl}`;
  }

  return email;
}

function makeValidEmailSenderName(name) {
  return `${toTitleCase(NAME)} ${name}`;
}

function makeValidSiteUrl(url, apiBasePath = `/api/v${apiVersion}/users`) {
  if(url.startsWith("/")) {
    url = stripFirstNCharsFromString(url, 1);
  }

  if(url.endsWith("/")) {
    url = stripLastNCharsFromString(url, 1);
  }

  if(apiBasePath.startsWith("/")) {
    apiBasePath = stripFirstNCharsFromString(apiBasePath, 1);
  }

  if(apiBasePath.endsWith("/")) {
    apiBasePath = stripLastNCharsFromString(apiBasePath, 1);
  }

  return baseUrl + (apiBasePath ? `/${apiBasePath}` : "") + `/${url}`;
}

function stripFirstNCharsFromString(str, n = 1) {
  return str.substring(n);
}

function stripLastNCharsFromString(str, n = 1) {
  return str.substring(0, str.length - n);
}

function toTitleCase(str) {
  return str.split(" ")
    .map(w => w[0].toUpperCase() + w.substring(1))
    .join(" ");
}
