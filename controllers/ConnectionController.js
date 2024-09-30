const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const Connection = require("../models/Connection");
const Dev = require("../models/Dev");

module.exports = class ConnectionController {
    static async follow(req, res) {

        let token = getToken(req);
        let dev = await getUserByToken(token);
        
        let { followedId } = req.body; 

        let followed = await Dev.findOne({ _id: followedId });

        if (!followed) {
            return res.status(422).json({ message: 'Usuário não encontrado! '});
        }

        let alreadyFollows = await Connection.findOne({ 
            followedId: followed._id.toString(),
            followerId: dev._id.toString()
        });

        if(alreadyFollows) {
            return res.status(422).json({ message: 'Você já segue esse usuário' });
        }        
        try {
            let follow = new Connection({
                followerId: dev._id.toString(),
                followedId: followed._id.toString()
            });

            let newFollow = await follow.save();

            return res.status(201).json({ message: `Você começou a seguir ${followed.username}!`, connection: newFollow });
        } catch (error) {
            return res.status(400).json({ message: 'Algo deu errado! '});
        }
    }

    static async followStatus(req, res) {
        let token = getToken(req);
        let dev = await getUserByToken(token);

        let { followedId } = req.body; 

        let followed = await Dev.findOne({ _id: followedId });

        if (!followed) {
            return res.status(422).json({ message: 'Usuário não encontrado! '});
        }
        
        try {
            let alreadyFollowYou = await Connection.findOne({
                followerId: followed._id.toString(),
                followedId: dev._id.toString(),
            });

            let alreadyYouFollow = await Connection.findOne({
                followedId: followed._id,
                followerId: dev._id,
            });
            
            return res.status(200).json({ 
                alreadyFollowYou: alreadyFollowYou != null ? true : false, 
                alreadyYouFollow: alreadyYouFollow != null ? true : false,
            });
        } 
        catch (error) {
            return res.status(422).json({ message: 'Algo deu errado' });
        }
    }

    static async followers(req, res) {
        let username = req.params.username;

        if (!username) {
            return res.status(422).json({ message: 'Informe um username!' });
        }

        let user = await Dev.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'Nenhum usuário encontrado.' });
        }

        try {            
            let followers = await Connection.find({ followedId: user._id.toString() }).select('followerId');
    
            let followersIds = followers.map(follow => follow.followerId);
    
            followers = await Dev.find({ _id: { $in: followersIds }});
    
            return res.status(200).json({ message: `Seguidores de ${user.username}`, followers:  followers, total: followers.length });
        } 
        catch (error) {
            return res.status(422).json({ message: 'Algo deu errado!' });
        }  
    }

    static async following(req, res) {
        let username = req.params.username;

        if (!username) {
            return res.status(422).json({ message: 'Informe um username!' });
        }

        let user = await Dev.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'Nenhum usuário encontrado.' });
        }

        try {            
            let following = await Connection.find({ followerId: user._id.toString() }).select('followedId');

            let followingIds = following.map(following => following.followedId);

            following = await Dev.find({ _id: { $in: followingIds }});
    
            return res.status(200).json({ message: `Usuarios seguidos por ${user.username}`, following: following, total: following.length });
        } 
        catch (error) {
            return res.status(422).json({ message: 'Algo deu errado!' });
        }
    }

    static async unfollow(req, res) {
        let token = getToken(req);
        let dev = await getUserByToken(token);

        let { followedId } = req.body; 

        let followed = await Dev.findOne({ _id: followedId });

        if (!followed) {
            return res.status(422).json({ message: 'Usuário não encontrado! '});
        }

        let alreadyFollows = await Connection.findOne({ 
            followedId: followed._id.toString(),
            followerId: dev._id.toString()
        });

        if (!alreadyFollows) {
            return res.status(422).json({ message: 'Você não segue esse usuário' });
        }

        try {            
            await Connection.findByIdAndDelete(alreadyFollows._id);
            return res.status(200).json({ message: `Você deixou de seguir ${followed.username}` });
        } 
        catch (error) {
            return res.status(422).json({ message: 'Algo deu errado!' });
        }
    }
}