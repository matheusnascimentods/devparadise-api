const jwt = require("jsonwebtoken");

const Dev = require("../models/Dev");

const getDevByToken = async (token) => {
    if (!token) return res.status(401).json({ error: "Acesso negado!" });

    const decoded = jwt.verify(token, "nossosecret");
    const userId = decoded.id;
    const dev = await Dev.findOne({ _id: userId });

    return dev;
};

module.exports = getDevByToken;