const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    const uri = process.env.MONGO_URI;

    await mongoose.connect(
        uri,
        { useNewUrlParser: true, useUnifiedTopology: true },
    );
    console.log('Database connection successful');
}

main().catch((err) => console.error(err));

module.exports = mongoose;