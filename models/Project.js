const mongoose = require('../database/connection');

const { Schema } = mongoose;

const Project = mongoose.model(
    'Project',
    new Schema({
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
        devId: {
            type: String,
            required: true,
        },
        images: {
            type: Array
        }
    }, {timestamps: true})
);

module.exports = Project;