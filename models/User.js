const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = Schema({
    token: String,
    userName: String,
    idUser: String,
},
    { timestamps: true }
);

module.exports = mongoose.model('user', user)
