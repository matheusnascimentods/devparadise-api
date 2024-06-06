const getProjectIndex = (list, id, res) => {
    let index = list.findIndex((item) => item._id.toString() === id);

    if(index < 0) {
        return res.status(422).json({ message: 'ID invalído' });
    }

    return index;
}

module.exports = getProjectIndex;