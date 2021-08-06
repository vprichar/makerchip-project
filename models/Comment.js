const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const comment = Schema({
    id: Number,
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
comment.plugin(AutoIncrement, {id:'id_seq',inc_field: 'id'});

module.exports = mongoose.model('comment', comment)
