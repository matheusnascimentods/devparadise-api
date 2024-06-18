//Imports
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Contractor = require('../models/Contractor');

//Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const Dev = require('../models/Dev');
const getProjectIndex = require('../helpers/get-project-index');

module.exports = class ContractorController {

    static async post(req, res) {
        let { name, username, email, cnpj, password } = req.body;

        let checkUsername = await Contractor.findOne({ username: username });
        
        if(checkUsername) {
            res.status(422).json({
                message: 'Username em uso'
            }); 
            return;
        }

        let checkEmail = await Contractor.findOne({ email: email });

        if(checkEmail) {
            res.status(422).json({
                message: 'Email em uso'
            });
            return;
        }

        let checkCnpj = await Contractor.findOne({ cnpj: cnpj });

        if(checkCnpj) {
            res.status(422).json({
                message: 'CNPJ em uso'
            });
            return;
        }

        //Create user
        let salt = await bcrypt.genSalt(12);
        let passwordHash = await bcrypt.hash(password, salt);

        let contractor = new Contractor({
            name: name, 
            username: username,
            email: email,
            linkedin: '',
            favoriteDevs: [],
            cnpj: cnpj,
            password: passwordHash
        });

        try {
            let newUser = await contractor.save();
            await createUserToken(newUser, req, res);
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    static async login(req, res) {
        
        let {email, password} = req.body;
        let user = await  Contractor.findOne({ email: email });

        if(!user) {
            return res.status(422).json({ message: 'E-mail não encontrado' });
        }

        let checkPassword = await bcrypt.compare(password, user.password);

        if(!checkPassword) {
            return res.status(422).json({ message: 'Senha invalída' });
        }

        await createUserToken(user, req, res);
    }

    static async get(req, res) {
        let id = req.query.id;

        if (id) {
            let data = await Contractor.find().sort('-createdAt');
            return res.status(200).json({ data: data });
        }

        let data = await Contractor.find().sort('-createdAt');
        return res.status(200).json({ data: data });
    }

    static async edit(req, res) {
        let { username, email, linkedin } = req.body;

        let token = getToken(req);        
        let contractor = await getUserByToken(token, Contractor);

        //Username validation
        let checkUsername = await Contractor.findOne({ username: username });

        if (contractor.username !== username && checkUsername) {
            return res.status(422).json({ message: 'username em uso'});
        }

        contractor.username = username;

        //Email validation
        let checkEmail = await Contractor.findOne({ email: email });

        if (contractor.email !== email && checkEmail) {
            return res.status(422).json({ message: 'E-mail em uso'});
        }

        contractor.email = email;
        
        contractor.linkedin = linkedin;

        if(!linkedin) {
            contractor.linkedin = "";
        }

        try {
            let updatedData = await Contractor.findOneAndUpdate(
                { _id: contractor._id },
                { $set: contractor },
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

        //Get contractor
        let token = getToken(req);
        let contractor = await getUserByToken(token, Contractor);

        //Check password
        let checkPassword = await bcrypt.compare(password, contractor.password);

        if(!checkPassword) {
            return res.status(422).json({ message: 'Senha invalída!'});
        }

        if(newPassword != confirmPassword) {
            return res.status(422).json({ message: 'As senhas não batem'});
        }

        //Create new password
        let salt = await bcrypt.genSalt(12);
        let passwordHash = await bcrypt.hash(newPassword, salt);

        //Change password
        contractor.password = passwordHash;

        await Contractor.findByIdAndUpdate(contractor._id, contractor);

        return res.status(204).json({ data: 'Operação realizada com sucesso!'});
    }

    static async changePfp(req, res) {
        if(!req.file) {
            return res.status(422).json({ message: 'Envie um arquivo de imagem!' });
        }
        
        let token = getToken(req);        
        let contractor = await getUserByToken(token, Contractor);

        let imageName = req.file.filename;
        contractor.image = imageName;

        try {
            let updatedData = await Contractor.findOneAndUpdate(
                { _id: contractor._id },
                { $set: contractor },
                { new: true },
            );

            updatedData.password = undefined;

            return res.json({ message: 'Operação realizada com sucesso!', data: updatedData });
        } catch (error) {
            return res.status(500).json({ message: error})
        }
    }

    static async favoriteDev(req, res) {
        let id = req.params.id;

        let devExists = await Dev.findById(id);

        if(!devExists) {
            return res.status(404).json({
                message: 'Algo deu errado! tente mais tarde.'
            });
        }

        let token = getToken(req);
        let contractor = await getUserByToken(token, Contractor);

        let devId = devExists._id.toString();

        contractor.favoriteDevs = [...contractor.favoriteDevs, devId];

        try {
            let updatedData = await Contractor.findOneAndUpdate(
                { _id: contractor._id },
                { $set: contractor },
                { new: true },
            );

            updatedData.password = undefined;
            
            res.json({ message: 'Operação realizada com sucesso!', data: updatedData });
        } catch (error) {
            res.status(500).json({ message: error })   
        }
    }

    static async removeDev(req, res) {
        let id = req.params.id;

        let devExists = await Dev.findById(id);

        if(!devExists) {
            return res.status(404).json({
                message: 'Algo deu errado! tente mais tarde.'
            });
        }

        let token = getToken(req);
        let contractor = await getUserByToken(token, Contractor);

        let index = contractor.favoriteDevs.findIndex((favorite) => favorite === id);

        contractor.favoriteDevs.splice(index, 1);
        await Contractor.findByIdAndUpdate(contractor._id, contractor);

        return res.status(204).json({ message: 'Operação realizada com sucesso' });
    }

    static async delete(req, res) {
        let token = getToken(req);
        let contractor = await getUserByToken(token, Contractor);

        await Contractor.findByIdAndDelete(contractor._id);

        return res.status(204).json({ message: 'Exclusão realizada com sucesso' });
    }
}