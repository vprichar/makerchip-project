const express = require('express');
const router = express.Router();
const {
    makeLoginWithGithub,
    makeLogOutEraseToken,
    makeLoginWithGithubV2,
    searchAccessTokenGithubWithCode,
    callbackGithubApp,

} = require('../controller/LoginController')

router.get('/login/github', makeLoginWithGithub);
router.get('/logout', makeLogOutEraseToken);
router.get('/install', makeLoginWithGithubV2);
router.get('/callback', searchAccessTokenGithubWithCode);
router.get('/callbackApp', callbackGithubApp);


module.exports = router;
