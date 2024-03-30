// Fields to return to the client when a new user is created
// or when user data is requested
const publicFields = [
  "id", "firstname", "lastname", "fullname",
  "email", "role", "status", "signupDate"
];

module.exports = publicFields;
