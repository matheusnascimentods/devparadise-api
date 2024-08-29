const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://0.0.0.0:27017/devparadise');
    console.log('Database connection successful');
}

main().catch((err) => console.error(err));

module.exports = mongoose;