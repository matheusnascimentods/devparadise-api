//Imports
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Contractor = require('../models/Contractor');

//Helpers
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');


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
}