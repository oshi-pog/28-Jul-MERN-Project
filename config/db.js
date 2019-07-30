const mongoose = require('mongoose');
const config = require('config');

// Getting all the values from the config file we created earlier and imported, specifically the JSON object called mongoURI.
const db = config.get('mongoURI');

//Using async and await to make it look synchronous even though it is asyncronous
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser:true
        });

        console.log('MongoDB Connected...');
    } catch(err) {
        console.log(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;