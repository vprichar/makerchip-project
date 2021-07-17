const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loveCount = Schema({
    idRepo: Number,
    idToken: String,
},
    { timestamps: true }
)

module.exports = mongoose.model('loveCount', loveCount)
