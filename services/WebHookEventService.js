const HookEvent = require("../models/HookEvent")

const saveResponseFromGithub = async (req,res)=> {
    console.log(req.body)
    const hookRegister = new HookEvent(req.body);
    hookRegister.save();
    
    console.log('saved')
    console.log(hookRegister)
    return true;
}

module.exports = {
    saveResponseFromGithub
}