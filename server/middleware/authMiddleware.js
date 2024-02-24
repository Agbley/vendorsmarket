const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  try {
    // get token from header
    const authorizationHeader = req.header("authorization");

    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }
    const token = authorizationHeader.split(" ")[1];
    // Verify the token
    const decryptedToken = jwt.verify(token, process.env.jwt_secret);
    // Add userId to the request
    req.body.userId = decryptedToken.userId;
    // Call the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification failure
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
