const jwt = require("jsonwebtoken");

const getUserByToken = async (token, model) => {
    if (!token) return res.status(401).json({ error: "Acesso negado!" });

    const decoded = jwt.verify(token, "nossosecret");
    const userId = decoded.id;
    const user = await model.findOne({ _id: userId });

    return user;
};

module.exports = getUserByToken;