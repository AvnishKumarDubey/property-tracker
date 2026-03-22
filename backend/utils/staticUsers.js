const bcrypt = require("bcryptjs");

const staticUsers = [
  {
    id: "static-admin",
    email: "admin@properties.com",
    username: "admin@properties.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
  },
  {
    id: "static-user",
    email: "user@properties.com",
    username: "user@properties.com",
    password: bcrypt.hashSync("user123", 10),
    role: "user",
  },
];

module.exports = { staticUsers };
