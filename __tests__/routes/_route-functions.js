const { apiPaths, usersUrl } = require("./_server");

const signupUrl     = `${usersUrl}${apiPaths.signup.path}`;
const loginUrl      = `${usersUrl}${apiPaths.login.path}`;
const userDataUrl   = `${usersUrl}`;
const userDeleteUrl = `${usersUrl}`;

module.exports = {
  createUser,
  deleteUser,
  fetchUserData,
  loginUser,
  loginAndDeleteUser,
};


async function createUser(userData) {
  const res = await fetch(signupUrl, {
    method: "post",
    body: JSON.stringify(userData),
    headers: { "Content-Type": "application/json" },
  });

  return await res.json();
}

async function deleteUser(userId, accessToken) {
  const res = await fetch(`${userDeleteUrl}/${userId}`, {
    method: "delete",
    body: JSON.stringify({ userId }),
    headers: {
      "Authorization" : accessToken,
      "Content-Type"  : "application/json"
    },
  });

  return await res.json();
}

async function fetchUserData(userId) {
  const response = await fetch(`${userDataUrl}/${userId}`, {
    headers: { "Content-Type": "application/json" },
  });

  return await response.json();
}

async function loginUser(email, password) {
  const response = await fetch(loginUrl, {
    method: "post",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });

  return await response.json();
}

async function loginAndDeleteUser(user) {
  const auth = await loginUser(user.email, user.password);
  const accessToken = auth.data.authorization.token;

  await deleteUser(user.id, accessToken);
}
