const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RepositoryMC = Schema({
    thumbnail_url: String,
    title: String,
    creator: String,
    type: String,
    id: Number,
    love_count: Number,
    stars: Number,
    ownerId: Number,
    avatarOwner: String
})

module.exports = mongoose.model('RepositoryMC', RepositoryMC)
