//Imports
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Dev = require('../models/Dev');

//Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const Project = require('../models/Project');

module.exports = class DevController {

    static async post(req, res) {
        let {name, username, email, cpf, phone, description, skils, password} = req.body;

        //Check if user exists
        let cpfExists = await Dev.findOne({ cpf: cpf});

        if(cpfExists) {
            res.status(422).json({
                message: 'CPF em uso'
            });
            return;
        }

        let emailExists = await Dev.findOne({ email: email});

        if(emailExists) {
            res.status(422).json({
                message: 'Email em uso'
            });
            return;
        }

        let usernameExists = await Dev.findOne({ username: username});

        if(usernameExists) {
            res.status(422).json({
                message: 'Username em uso'
            });
            return;
        }

        //Create user
        let salt  = await bcrypt.genSalt(12);
        let passwordHash = await bcrypt.hash(password, salt);

        let dev = new Dev({
            name: name,
            username: username,
            email: email, 
            skils: skils,
            cpf: cpf,
            phone: phone,
            description: description,
            password: passwordHash,
        });

        try {
            let newUser = await dev.save();
            await createUserToken(newUser, req, res); 
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async login(req, res) {''
          
        let {email, password} = req.body;

        let dev = await Dev.findOne({ email: email });

        if(!dev) {
            return res.status(422).json({ message: 'E-mail não encontrado'});
        }

        let checkPassword = await bcrypt.compare(password, dev.password);

        if(!checkPassword) {
            return res.status(422).json({ message: 'Senha invalída'});
        }
        
        await createUserToken(dev, req, res); 
    }

    static async get(req, res) {
        let id = req.query.id;

        if (id) {
            let data = await Dev.findOne({ _id: id });

            if (!data) {
                return res.status(404).json({ message: 'Nenhum usuário encontrado.' });
            }

            let projects = await Project.find({ devId: data._id.toString() });
            return res.status(200).json({ data: data, projects: projects });            
        }

        let username = req.query.username;

        if (username) {
            let data = await Dev.findOne({ username: username });

            if (!data) {
                return res.status(404).json({ message: 'Nenhum usuário encontrado.' });
            }

            let projects = await Project.find({ devId: data._id.toString() });          
            return res.status(200).json({ data: data, projects: projects });            
        }

        let data = await Dev.find().sort('-createdAt');
        return res.status(200).json({ data: data });
    }
    
    static async myProjects(req, res) {
        let token = getToken(req);
        let dev = await getUserByToken(token, Dev);

        let title = req.query.title;

        if (title) {
            title = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            let data = await Project.find({ title: { $regex: title, $options: 'i' } });
            return res.status(200).json({ data: data, total: data.length });
        }

        let projects = await Project.find({ devId: dev._id.toString() });

        return res.json({ devId: dev._id.toString(), projects: projects})
    }

    static async getUserByToken (req, res) {

        let token = getToken(req);
        let dev = await getUserByToken(token, Dev);

        let projects = await Project.find({ devId: dev._id.toString() });

        return res.json({ dev: dev, projects: projects})
    }

    static async edit(req, res) {
        let { name, username, email, phone, description, skils, github, linkedin } = req.body;
        
        let token = getToken(req);        
        let dev = await getUserByToken(token, Dev);

        //Validation
        if (!name) {
            return res.status(422).json({ message: 'Informe o seu nome!' });
        }
        if (!username) {
            return res.status(422).json({ message: 'Informe o seu username!' });
        }
        if (!email) {
            return res.status(422).json({ message: 'Informe o seu email!' });
        }
        if (!description) {
            return res.status(422).json({ message: 'Informe a sua descrição!' });
        }
        
        //Username validation
        let checkUsername = await Dev.findOne({ username: username });

        if (dev.username !== username && checkUsername) {
            return res.status(422).json({ message: 'username em uso'});
        }

        dev.username = username;

        //Email validation
        let checkEmail = await Dev.findOne({ email: email });

        if (dev.email !== email && checkEmail) {
            return res.status(422).json({ message: 'E-mail em uso'});
        }

        let image = '';
        if (req.file) {
            image = req.file.filename
        } else {
            image = dev.image;
        }

        dev.name = name;
        dev.email = email;
        dev.description = description;
        dev.skils = skils;
        dev.phone = phone;
        dev.github = github;
        dev.linkedin = linkedin;
        dev.image = image;

        try {
            let updatedData = await Dev.findOneAndUpdate(
                { _id: dev._id },
                { $set: dev },
                { new: true },
            );

            updatedData.password = undefined;

            return res.json({ message: 'Operação realizada com sucesso!', data: updatedData });
        } catch (error) {
            return res.status(500).json({ message: error})
        }
    }

    static async changePassword(req, res) {

        let { password, newPassword, confirmPassword } = req.body;

        //Get dev
        let token = getToken(req);
        let dev = await getUserByToken(token, Dev);

        //Check password
        let checkPassword = await bcrypt.compare(password, dev.password);

        if(!checkPassword) {
            return res.status(422).json({ message: 'Senha invalída'});
        }

        //Check that the passwords match
        if (newPassword != confirmPassword) {
            return res.status(422).json({ message: 'As senhas não batem'});
        }

        //Create new password
        let salt  = await bcrypt.genSalt(12);
        let passwordHash = await bcrypt.hash(newPassword, salt);

        //Change password
        dev.password = passwordHash;

        await Dev.findByIdAndUpdate(dev._id, dev);

        return res.status(204).json({ data: 'Operação realizada com sucesso!'});
    }

    static async delete(req, res) {
        let token = getToken(req);
        let dev = await getUserByToken(token, Dev);

        await Dev.findByIdAndDelete(dev._id);

        return res.status(204).json({ message: 'Exclusão realizada com sucesso' });
    }
}