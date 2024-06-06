const ObjectId = require('mongoose').Types.ObjectId

const checkToken = (req, res, next) => {
    let { id } = req.params;

    if(!ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'Id invalído' });
    }

    next();
}

module.exports = checkToken;