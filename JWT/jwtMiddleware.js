const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (token === undefined) {
    token = req.body.headers["x-access-token"];
  }

  if (!token) {
    res.send("Token required");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.json({ auth: false, message: "Authentication failed" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

module.exports = { verifyJWT };
