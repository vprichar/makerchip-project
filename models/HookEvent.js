const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HookEventSchema = Schema({
    action: String,
    ref: String,
    before: String,
    repositories: [],
    repository: {},
    pusher: {},
    sender: {},
    created: Boolean,
    deleted: Boolean,
    forced: Boolean,
    base_ref: String,
    compare: String,
    commits: {},
    head_commit: {}
},
    { timestamps: true }
)

module.exports = mongoose.model('HookEvent', HookEventSchema)