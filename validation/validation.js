const validator = require("validator");

function signupDataValidation(req) {
  const { emailId, password } = req.body;

  if (!emailId) {
    throw new Error("Email is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  }

  // Optionally, validate password strength here
}

module.exports = {
  signupDataValidation,
};
