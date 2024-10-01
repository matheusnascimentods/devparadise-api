const mongoose = require('../database/connection');

const { Schema } = mongoose;

const Connection = mongoose.model (
    'Connection',
    new Schema({
        followerId: {
            type: String,
            required: true,
        },
        followedId: {
            type: String,
            required: true,
        },
    }, {timestamps: true})
);

module.exports = Connection;