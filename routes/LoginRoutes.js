const express = require('express');
const router = express.Router();
const {
    makeLoginWithGithub,
    searchAccessTokenGithubWithCode,
    searchRepositoryOrgByUser,
    makeLogOutEraseToken,
    savePingWebHookEvent,
    getContentRepo,
    findAllRepo,
    detailRepo
} = require('../controller/LoginController')

router.get('/login/github', makeLoginWithGithub);
router.get('/logout', makeLogOutEraseToken);
router.get('/callback', searchAccessTokenGithubWithCode);
router.get('/repository', searchRepositoryOrgByUser);
router.post('/hooks', savePingWebHookEvent);
router.get('/getContentRepo', getContentRepo);
router.get('/getAllRepo', findAllRepo);
router.get('/projects/:id', detailRepo);
module.exports = router;
