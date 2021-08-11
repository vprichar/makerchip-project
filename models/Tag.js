const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const tag = Schema({
    idRepo: Number,
    text: String
},
    { timestamps: true }
);
tag.plugin(AutoIncrement, {id:'id_seqTag',inc_field: 'id'});

module.exports = mongoose.model('tag', tag)
