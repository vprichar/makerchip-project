const express = require('express');
const router = express.Router();
const {
    searchRepositoryOrgByUser,
    savePingWebHookEvent,
    getContentRepo,
    findAllRepo,
    detailRepo,
    repoOnlyUser,
    addLove,
    addComment,
    getComment,
} = require('../controller/GithubController')


router.get('/repository', searchRepositoryOrgByUser);
router.post('/hooks', savePingWebHookEvent);
router.get('/getContentRepo', getContentRepo);
router.get('/getAllRepo', findAllRepo);
router.get('/projects/:id', detailRepo);
router.get('/getMyRepo', repoOnlyUser);
router.get('/addLove/:id', addLove);
router.post('/addComment', addComment);
router.get('/getComment/:id', getComment);
module.exports = router;