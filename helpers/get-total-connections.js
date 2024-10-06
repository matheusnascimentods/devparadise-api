const Connection = require('../models/Connection');
const User = require('../models/User');

const getTotalConnections = async (user) => {
    //following
    let following = await Connection.find({ followerId: user._id.toString() }).select('followedId');
    let followingIds = following.map(following => following.followedId);
    following = await User.find({ _id: { $in: followingIds }});

    let followingTotal = following.length;

    //followers
    let followers = await Connection.find({ followedId: user._id.toString() }).select('followerId');
    let followersIds = followers.map(follow => follow.followerId);
    followers = await User.find({ _id: { $in: followersIds }});

    let followersTotal = followers.length;

    let total = {
        following: followingTotal,
        followers: followersTotal,
    }

    return total;
}

module.exports = getTotalConnections;