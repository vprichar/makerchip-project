const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = Schema({
    idRepo: Number,
    idToken: String,
    content: String,
    parent_id: String,
    visibility: String,
    author: Object,
    reply_count: Number
},
    { timestamps: true }
);

module.exports = mongoose.model('comment', comment)
