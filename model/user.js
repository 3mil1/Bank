const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        max: 255,
        min: 6,
        unique: true
    },
    password: {
        type: String,
        require: true,
        max: 1024,
        min: 6
    },
    date: {
        type: Date,
        default: Date.now
    }

});

const transactions = new mongoose.Schema({
    
})

module.exports = mongoose.model('User', userSchema);


