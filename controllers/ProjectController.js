//Imports
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId
const Project = require('../models/Project');
const Dev = require('../models/Dev');

//Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class ProjectController {

    static async addProject(req, res) {
        let {title, description, repository, link, technologies} = req.body;
        let files = req.files;

        if (!title) {
            return res.status(422).json({ message: 'Informe o nome do projeto!' });
        }

        if (!description) {
            return res.status(422).json({ message: 'Informe a descrição do projeto!' });
        }

        let token = getToken(req);
        let dev = await getUserByToken(token);

        let images = [];
        if (files) {
            files.map((file) => {
                images.push(file.filename)
            });
        }  

        let project = new Project({
            title: title,
            description: description,
            repository: repository,
            images: images,
            technologies: technologies,
            link: link,
            devUsername: dev.username,
            devId: dev._id.toString(),
        });

        try {
            let data = await project.save();
            return res.status(201).json({ data: data });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async get(req, res) {
        let q = req.query.q;

        if (q) {
            let data = await Project.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { devUsername: { $regex: q, $options: 'i' } },
                    { technologies: { $in: [q] }}
                ]
            }).sort('-createdAt');

            return res.status(200).json({ data: data, total: data.length });         
        }

        let data = await Project.find().sort('-createdAt');
        return res.status(200).json({ data: data });
    }

    static async getById(req, res) {
        let {id} = req.params;

        let data = await Project.findOne({ _id: id });

        if (!data) {
            return res.status(404).message({ message: 'Nada encontrado! '});
        }

        return res.status(200).json({ data: data }); 
    }

    static async getImages(req, res) {
        let {id} = req.params;

        let project = await Project.findById(id);

        if(!project) {
            return res.status(404).json({ message: 'Projeto não encontrado!' });
        }

        return res.status(200).json({ images: project.images });
    }

    static async getFavorites(req, res) {
        let { username } = req.params;

        let dev = await Dev.findOne({ username: username });

        if(!dev) {
            return res.status(404).json({ message: "Usuario não encontrado!" });
        }

        let data = await Project.find({ devUsername: username, favorite: true }).sort('-createdAt');

        return res.status(200).json({ projects: data, total: data.length });
    }

    static async editProject(req, res) {
        
        //Get and check id
        let { id } = req.params;

        let project = await Project.findById(id);

        if(!project) {
            return res.status(404).json({ message: 'Projeto não encontrado!' });
        }

        //Get by token
        let token = getToken(req);
        let dev = await getUserByToken(token);

        if (project.devId !== dev._id.toString()) {
            return res.status(401).json({ message: 'Algo deu errado!' });
        }

        let { title, description, repository, link, technologies } = req.body;
        let files = req.files;
        
        if(!title || !description) {
            return res.status(422).json({ message: 'Preencha todos os campos!' });
        }

        let images = [];

        if (files) {
            files.map((file) => {
                images.push(file.filename)
            });
        } 
        
        if (!req.files || req.files.length === 0) {
            images = project.images;            
        }

        project.title = title;
        project.description = description;
        project.repository = repository;
        project.link = link;
        project.images = images;
        project.technologies = technologies;

        try {
            let data = await Project.findOneAndUpdate(
                { _id: project._id },
                { $set: project },
                { new: true },
            );
            
            res.json({
                message: 'Operação realizada com sucesso!',
                data: data,
            });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async favorite(req, res) {
        
        let { id } = req.body;

        if(!id) {
            console.log('f')
            return res.status(422).json({ message: 'ID invalído!'})
        }

        if(!ObjectId.isValid(id)) {
            console.log('g')
            return res.status(422).json({ message: 'Id invalído!' });

        }

        
        //Get user and project
        let token = getToken(req);
        let dev = await getUserByToken(token);

        let project = await Project.findOne({ 
            _id: id, 
            devId: dev._id.toString()
        });

        if (!project) {
            return res.status(404).json({ message: 'Projeto não encontrado!' });
        }

        let message = '';

        if (project.favorite === false) {
            project.favorite = true;
            message = 'Este projeto foi adicionado aos seus favoritos!';
        } else  {
            project.favorite = false;
            message = 'Este projeto foi removido dos seus favoritos!';
        }

        try {
            let updatedDatadata = await Project.findOneAndUpdate(
                { _id: project._id },
                { $set: project },
                { new: true },
            );

            return res.status(200).json({ project: updatedDatadata, message: message });

        } catch (error) {
            return res.status(500).json({ message: error});
        }  
    }

    static async deleteProject(req, res) {
        let { id } = req.params;

        let project = await Project.findById(id);

        if(!project) {
            return res.status(404).json({ message: 'Projeto não encontrado!' });
        }

        //Get by token
        let token = getToken(req);
        let dev = await getUserByToken(token);

        if (project.devId !== dev._id.toString()) {
            return res.status(401).json({ message: 'Algo deu errado!' });
        }

        await Project.findByIdAndDelete(project._id);

        return res.status(200).json({ message: 'Exclusão realizada com sucesso' });
    }
}