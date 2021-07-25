const HookEvent = require("../models/HookEvent")
const User = require("../models/User");

const saveResponseFromGithub = async (req, res) => {
    const hookRegister = new HookEvent(req.body);
    hookRegister.save();
    console.log('saved')
    return hookRegister;
}

module.exports = {
    saveResponseFromGithub
}