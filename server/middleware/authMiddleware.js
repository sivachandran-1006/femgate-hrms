const jwt = require("jsonwebtoken");

const authMiddleware = (
  req,
  res,
  next
) => {

  try {

    const token =
      req.headers.authorization;

    if (!token) {

      return res.status(401).json({
        message: "No Token",
      });

    }

    const verified =
      jwt.verify(
        token,
        "mgate_secret_key"
      );

    req.user = verified;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid Token",
    });

  }

};

module.exports =
  authMiddleware;
