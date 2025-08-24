const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  verifyPassword
};
