const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loveCount = Schema({
    idRepo: Number,
    idToken: String,
})

module.exports = mongoose.model('loveCount', loveCount)
