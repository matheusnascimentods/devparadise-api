//Imports
const ObjectId = require('mongoose').Types.ObjectId
const Project = require('../models/Project');
const User = require('../models/User');

//Helpers
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class ProjectController {

    static async publish(req, res) {
        let {title, description, repository, link, technologies} = req.body;
        let files = req.files;

        if (!title) {
            return res.status(422).json({ message: 'Informe o nome do projeto!' });
        }

        if (!description) {
            return res.status(422).json({ message: 'Informe a descrição do projeto!' });
        }

        let token = getToken(req);
        let user = await getUserByToken(token, res);

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
            devUsername: user.username,
            devId: user._id.toString(),
        });

        try {
            let data = await project.save();
            return res.status(201).json({ data: data });
        } 
        catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async get(req, res) {
        let { q, id, author } = req.query;

        if (q && author) {
            let user = await User.findOne({ username: author });

            if (!user) {
                return res.status(404).json({ message: "Usuario não encontrado!" }); 
            }

            let projects = await Project.find({
                devId: user._id.toString(),
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { devUsername: { $regex: q, $options: 'i' } },
                    { technologies: { $in: [q] }}
                ]
            }).sort('-createdAt');

            return res.status(200).json({ message: `Projetos de ${user.username}`, projects: projects, user: user, total: projects.length });
        }

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

        if (id) {
            let data = await Project.findOne({ _id: id });

            if (!data) {
                return res.status(404).message({ message: 'Este projeto não existe' });
            }

            let user = await User.findOne({ _id: data.devId });

            return res.status(200).json({ data: data, user: user }); 
        }

        if (author) {
            let user = await User.findOne({ username: author });

            if (!user) {
                return res.status(404).json({ message: "Usuario não encontrado!" }); 
            }

            let projects = await Project.find({ devId: user._id.toString() }).sort({ favorite: -1 });


            return res.status(200).json({ message: `Projetos de ${user.username}`, projects: projects, user: user, total: projects.length });
        }

        let data = await Project.find().sort('-createdAt');
        return res.status(200).json({ data: data, total: data.length });
    }

    static async myProjects(req, res) {
        let token = getToken(req);
        let user = await getUserByToken(token, res);

        let q = req.query.q;

        if(q) {
            let data = await Project.find({
                $and: [
                    { devId: user._id.toString() },
                    {
                        $or: [
                            { title: { $regex: q, $options: 'i' } },
                            { description: { $regex: q, $options: 'i' } },
                            { technologies: { $in: [q] }}
                        ]
                    }
                ]
            }).sort({ favorite: 1 });

            return res.status(200).json({ data: data, total: data.length });     
        }

        let projects = await Project.find({ devId: user._id.toString() }).sort({ favorite: -1 });

        return res.json({ devId: user._id.toString(), projects: projects, total: projects.length})
    }

    static async update(req, res) {
        
        //Get and check id
        let { id } = req.params;

        //Get by token
        let token = getToken(req);
        let user = await getUserByToken(token, res);

        let project = await Project.findOne({ _id: id, devId: user._id.toString() });

        if(!project) {
            return res.status(404).json({ message: 'Projeto não encontrado!' });
        }

        let { title, description, repository, link, technologies } = req.body;
        let files = req.files;
        
        if(!title) {
            return res.status(422).json({ message: 'Informe o nome do projeto!' });
        }

        if (!description) {
            return res.status(422).json({ message: 'Informe a descrição do projeto!' });
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
            return res.status(422).json({ message: 'ID invalído!'})
        }

        if(!ObjectId.isValid(id)) {
            return res.status(422).json({ message: 'Id invalído!' });
        }
        
        //Get user and project
        let token = getToken(req);
        let user = await getUserByToken(token, res);

        let project = await Project.findOne({ 
            _id: id, 
            devId: user._id.toString()
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

    static async delete(req, res) {
        let { id } = req.params;

        //Get by token
        let token = getToken(req);
        let user = await getUserByToken(token, res);

        let project = await Project.findOne({ _id: id, devId: user._id.toString() });

        if(!project) {
            return res.status(404).json({ message: 'Projeto não encontrado!' });
        }

        try {
            await Project.findOneAndDelete({ _id: project._id.toString() })
            return res.status(200).json({ message: 'Exclusão realizada com sucesso' });
        } 
        catch (error) {
            return res.status(500).json({ message: error });
        }
    }
}