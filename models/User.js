const mongoose = require('../database/connection');

const { Schema } = mongoose;

const User = mongoose.model(
    'User',
    new Schema({
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        cpf: {
            type: Number,
            required: true
        },
        image: {
            type: String,
        },
        description: {
            type: String,
        },
        github: {
            type: String
        }, 
        linkedin: {
            type: String
        },
        skils: {
            type: [String],
        },
        password: {
            type: String,
            required: true
        },
    }, {timestamps: true}),
);

module.exports = User;