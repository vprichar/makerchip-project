const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HookEventSchema = Schema({
    ref: String,
    before: String,
    repository: {},
    pusher:{},
    sender:{},
    created: Boolean,
    deleted: Boolean,
    forced: Boolean,
    base_ref: String,
    compare: String,
    commits:{},
    head_commit:{}
})

module.exports = mongoose.model('HookEvent', HookEventSchema)