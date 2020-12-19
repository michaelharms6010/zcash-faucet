const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  const secret = secrets.jwtSecret;

  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if(err) {
        console.log('token validation failed')
        res.status(401).json('Unauthorized')
      } else {
        req.decodedJwt = decodedToken;
        console.log(decodedToken)
        next();
      }
    });
  } else {
    console.log('no token')
    res.status(401).json({ you: 'failed' });
  }
};