const bcrypt = require("bcrypt");
const jwt =  require("jsonwebtoken");
const randomBytes = require("random-bytes");


module.exports = {
  hashPassword,
  checkPassword,
  generateAuthToken,
  decodeAuthToken,
  getAuthTokenFromAuthorizationHeader,
  getUserFromAuthToken,
};


async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function checkPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function generateAuthToken(userId, email, tokenSecret, tokenExpiry) {
  const authToken   = randomBytes(32).toString("hex");
  const tokenData   = { userId, email, authToken };
  const signedToken = jwt.sign(tokenData, tokenSecret, {
    expiresIn: tokenExpiry
  });

  return { token: signedToken, expiry: tokenExpiry };
}

function decodeAuthToken(token, tokenSecret) {
  return jwt.verify(token, tokenSecret);
}

function getAuthTokenFromAuthorizationHeader(headerString) {
  const bearerData = headerString.split(" ");

  if(!Array.isArray(bearerData) || bearerData.length !== 2) {
    return "";
  }

  const [ bearerString, bearerToken ] = bearerData;

  if(!bearerToken || bearerString !== "Bearer") {
    return "";
  }

  return bearerToken;
}

/**
 * @throws TokenExpiredError
 */
async function getUserFromAuthToken(token, tokenSecret, userService) {
  if(!token || !tokenSecret) {
    return null;
  }

  const decoded = decodeAuthToken(token, tokenSecret);

  if(!decoded) {
    return null;
  }

  const { userId, email } = decoded;
  const user = await userService.findById(userId);

  if(!user || user.email !== email) {
    return null;
  }

  return user;
}
