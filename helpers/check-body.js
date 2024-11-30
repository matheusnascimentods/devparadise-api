const { validationResult } = require('express-validator');

const checkBody = (req, res, next) => {
  const errors = validationResult(req);

  // If there are validation errors, respond with a 400 Bad Request status
  if (!errors.isEmpty()) {
    console.log(errors)
    return res.status(400).json({ errors: errors.array() });
  }

  next();
}

module.exports = checkBody;