const express = require('express');
const router = express.Router();
const {
    makeLoginWithGithub,
    searchAccessTokenGithubWithCode,
    searchRepositoryOrgByUser,
    makeLogOutEraseToken,
    savePingWebHookEvent
} = require('../controller/LoginController')

router.get('/login/github', makeLoginWithGithub);
router.get('/logout', makeLogOutEraseToken);
router.get('/callback', searchAccessTokenGithubWithCode);
router.get('/repository', searchRepositoryOrgByUser);
router.post('/hooks', savePingWebHookEvent);


module.exports = router;
