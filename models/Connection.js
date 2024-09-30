const mongoose = require('../database/connection');

const { Schema } = mongoose;

const Connection = mongoose.model (
    'Connection',
    new Schema({
        followerId: {
            type: String,
            required: true,
            ref: 'Dev',
        },
        followedId: {
            type: String,
            required: true,
            ref: 'Dev',
        },
    }, {timestamps: true})
);

module.exports = Connection;