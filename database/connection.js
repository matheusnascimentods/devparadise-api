const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://localhost:27017/devparadise');
    console.log('Database connection successful');
}

main().catch((err) => console.error(err));

module.exports = mongoose;