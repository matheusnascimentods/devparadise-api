const mongoose = require('mongoose');

const { Schema } = mongoose;

const Contractor = mongoose.model(
    'Contractor',
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
        cnpj: {
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
    }, {timestamps: true}),
);

module.exports = Contractor;