const mongoose = require('../database/connection');

const { Schema } = mongoose;

const Dev = mongoose.model(
    'Dev',
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
        phone: {
            type: Number, 
            required: true
        },
        image: {
            type: String,
        },
        password: {
            type: String,
            required: true
        },
        projects: [{
            title: {
                type: String,
                required: true
            }, 
            description: {
                type: String,
                required: true
            },
            repository: {
                type: String,
            },
            images: {
                type: Array
            }
        }, {timestamps: true}]
    }, {timestamps: true}),
);

module.exports = Dev;