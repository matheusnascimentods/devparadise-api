//Imports
const bcrypt = require('bcrypt')
const User = require('../models/User');
const Project = require('../models/Project');

//Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const Connection = require("../models/Connection");
const getTotalConnections = require('../helpers/get-total-connections');

module.exports = class UserController {

    static async signup(req, res) {
        let {name, username, email, cpf, phone, description, skils, password} = req.body;

        //Check if user exists
        let cpfExists = await User.findOne({ cpf: cpf});

        if(cpfExists) {
            return res.status(422).json({ message: 'CPF em uso' });
        }

        let emailExists = await User.findOne({ email: email});

        if(emailExists) {
            return res.status(422).json({ message: 'Email em uso' });
        }

        let usernameExists = await User.findOne({ username: username});

        if(usernameExists) {
            return res.status(422).json({ message: 'Username em uso' });
        }

        //Create user
        let salt  = await bcrypt.genSalt(12);
        let passwordHash = await bcrypt.hash(password, salt);

        let user = new User({
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
            let newUser = await user.save();
            await createUserToken(newUser, req, res); 
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async login(req, res) {''
          
        let {login, password} = req.body;

        let user = await User.findOne({
            $or: [
                { email: login },
                { username: login },
            ]
        });

        if(!user) {
            return res.status(422).json({ message: 'Usuário não encontrado'});
        }

        let checkPassword = await bcrypt.compare(password, user.password);

        if(!checkPassword) {
            return res.status(422).json({ message: 'Senha invalída'});
        }
        
        await createUserToken(user, req, res); 
    }

    static async get(req, res) {
        const { q, username, id } = req.query;

        if (q) {
            let users = await User.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { username: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { skils: { $elemMatch: { $regex: q, $options: 'i' } } }
                ]
            }).sort('-createdAt');

            return res.status(200).json({ data: users, total: users.length });            
        }

        if (username) {
            let user = await User.findOne({ username: username });

            if(!user) {
                return res.status(404).json({ message: "Usuario não encontrado" }); 
            }

            let projects = await Project.find({ devId: user._id.toString() });

            let totalConnections = await getTotalConnections(user);

            return res.status(200).json({ data: user, projects: projects, following: totalConnections.following, followers: totalConnections.followers }); 
        }

        if (id) {
            let user = await User.findOne({ _id: id });

            if (!user) {
                return res.status(404).json({ message: 'Nenhum usuário encontrado.' });
            }

            let projects = await Project.find({ devId: user._id.toString() });

            let totalConnections = await getTotalConnections(user);

            return res.status(200).json({ data: user, projects: { projects: projects, total: projects.length }, following: totalConnections.following, followers: totalConnections.followers });  
        }

        let users = await User.find().sort('-createdAt');
        return res.status(200).json({ data: users, total: users.length });
    }

    static async getCurrentUser (req, res) {

        let token = getToken(req);
        let user = await getUserByToken(token, res);

        if(!user) {
            return res.status(204);
        }

        let projects = await Project.find({ devId: user._id.toString() });

        let totalConnections = await getTotalConnections(user);

        return res.json({ dev: user, projects: projects, following: totalConnections.following, followers: totalConnections.followers })
    }

    static async edit(req, res) {
        let { name, username, email, phone, description, skils, github, linkedin } = req.body;
        
        let token = getToken(req);        
        let user = await getUserByToken(token, res);

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
        let checkUsername = await User.findOne({ username: username });

        if (user.username !== username && checkUsername) {
            return res.status(422).json({ message: 'username em uso'});
        }

        user.username = username;

        //Email validation
        let checkEmail = await User.findOne({ email: email });

        if (user.email !== email && checkEmail) {
            return res.status(422).json({ message: 'E-mail em uso'});
        }

        let image = '';
        if (req.file) {
            image = req.file.filename
        } else {
            image = user.image;
        }

        user.name = name;
        user.email = email;
        user.description = description;
        user.skils = skils;
        user.phone = phone;
        user.github = github;
        user.linkedin = linkedin;
        user.image = image;

        try {
            let updatedData = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true },
            );

            await Project.updateMany({ devId: user._id }, { devUsername: updatedData.username });

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
        let user = await getUserByToken(token, res);

        //Check password
        let checkPassword = await bcrypt.compare(password, user.password);

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
        user.password = passwordHash;

        await User.findByIdAndUpdate(user._id, user);

        return res.status(204).json({ data: 'Operação realizada com sucesso!'});
    }

    static async delete(req, res) {
        let token = getToken(req);
        let user = await getUserByToken(token, res);

        let {password} = req.body;

        //check password
        let checkPassword = await bcrypt.compare(password, user.password);

        if(!checkPassword) {
            return res.status(422).json({ message: 'Senha invalída'});
        }

        let id = user._id;

        await User.findByIdAndDelete(id);
        await Project.deleteMany({ devId: id });

        return res.status(204).json({ message: 'Exclusão realizada com sucesso' });
    }
}