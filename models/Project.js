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
        devUsername: {
            type: String,
            required: true,
        },
        link: {
            type: String,
        },
        technologies: {
            type: [String]
        },
        images: {
            type: Array
        },
        favorite: {
            type: Boolean,
            default: false,
        }
    }, {timestamps: true})
);

module.exports = Project;