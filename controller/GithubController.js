const serviceGithub = require('../services/GithubServices');
const webhookService = require('../services/WebHookEventService');

const {
    USER_GITHUB_FOUND,
    ERROR_LOGIN_NOT_AUTH
} = require('../utils/Constants');




const findAllRepo = async (req, res) => {
    try {
        const access_token = req.headers.authorization.split(' ')[1];
        const resp = await serviceGithub.findAllRepoMC(access_token);
        res.status(200).send(resp);

    } catch (error) {
        throw new Error(error);

    }
}

const searchRepositoryOrgByUser = async (req, res) => {
    try {
        const community_newest_projects = await serviceGithub.getReposByOrganization();
        if (community_newest_projects) {
            res.status(200).send({ community_newest_projects });
        } else {
            res.status(200).send({
                error: false,
                message: 'Repository',
                data: {}
            })
        }
    } catch (error) {
        throw new Error(error);
    }
}

const createRepositoryGithubAndUploadFiles = async (req, res) => {
    try {
        const access_token = req.headers.authorization.split(' ')[1];
        const name_repo = req.body.name_repo;
        const repos = await serviceGithub.createRepoAndUploadFilesByUserWithTokenAuth(access_token, name_repo);
        if (repos) {
            res.status(200).send({
                error: false,
                message: 'Repository',
                data: repos
            })
        } else {
            res.status(200).send({
                error: false,
                message: 'Repository',
                data: {}
            })
        }

    } catch (error) {
        throw new Error(error);
    }
}

const savePingWebHookEvent = async (req, res) => {
    try {
        const saved = await webhookService.saveResponseFromGithub(req, res);
        if (saved.repository) {
            const idRepo = saved.repository.id
            let filter = { id: idRepo };
            const repoExists = await serviceGithub.findAllRepoMC(filter);
            if (repoExists) {
                await serviceGithub.updateRepoMongo(idRepo, process.env.TOKEN_API_GIT);
            }
        }
        res.status(200).send({
            error: false,
            message: 'Saved!',
            data: {}
        })
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: {}
        })
        throw new Error(error);
    }
}

const getContentRepo = async (req, res) => {
    try {
        const owner = req.query.owner;
        const repoName = req.query.repo;
        console.log(req.query);
        const access_token = req.headers.authorization.split(' ')[1];
        const infoRepo = await serviceGithub.getContentRepo(owner, repoName, access_token);

        res.status(200).send({
            error: false,
            message: 'Saved!',
            data: infoRepo
        })
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: {}
        })
        throw new Error(error);
    }
}

const detailRepo = async (req, res) => {
    try {
        const id = req.params.id;
        const access_token = (req.headers.authorization && req.headers.authorization.length > 10) ? req.headers.authorization.split(' ')[1] : process.env.TOKEN_API_GIT;
        const infoRepo = await serviceGithub.detailRepo(id, access_token);
        res.status(200).send(infoRepo)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

const repoOnlyUser = async (req, res) => {
    try {
        const access_token = (req.headers.authorization && req.headers.authorization.length > 10) ? req.headers.authorization.split(' ')[1] : process.env.TOKEN_API_GIT;
        const myRepos = await serviceGithub.repoOnlyUser(access_token);
        res.status(200).send(myRepos)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

const addLove = async (req, res) => {
    try {
        const id = req.params.id;
        const access_token = (req.headers.authorization && req.headers.authorization.length > 10) ? req.headers.authorization.split(' ')[1] : process.env.TOKEN_API_GIT;
        const myRepos = await serviceGithub.addRemoveLove(id, access_token);
        res.status(200).send(myRepos)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

const addComment = async (req, res) => {
    try {
        const idRepo = req.body.idRepo;
        const parent_id = (req.body.parent_id) ? req.body.parent_id : null;
        const comment = req.body.comment;
        const access_token = (req.headers.authorization && req.headers.authorization.length > 10) ? req.headers.authorization.split(' ')[1] : process.env.TOKEN_API_GIT;
        const addComment = await serviceGithub.addComment(idRepo, access_token, parent_id, comment);
        res.status(200).send(addComment)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

const getComment = async (req, res) => {
    try {
        const idRepo = req.params.id;
        const getComments = await serviceGithub.getComment(idRepo);
        res.status(200).send(getComments)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

const getChildComment = async (req, res) => {
    try {
        const idComment = req.params.id;
        const getComments = await serviceGithub.getChildComment(idComment);
        res.status(200).send(getComments)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

const createFile = async (req, res) => {
    try {
        const access_token = (req.headers.authorization && req.headers.authorization.length > 10) ? req.headers.authorization.split(' ')[1] : process.env.TOKEN_API_GIT;
        const message = req.body.message;
        const path = req.body.path;
        const repo = req.body.repo;
        const owner = req.body.owner;
        const str = req.body.content;
        const buff = Buffer.from(str, 'utf-8');
        const base64 = buff.toString('base64');
        const content = base64;
        let body = {
            message,
            path,
            repo,
            owner,
            content
        }
        const file = await serviceGithub.createFile(access_token, body);
        res.status(200).send(file)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}


const deleteFile = async (req, res) => {
    try {
        const access_token = (req.headers.authorization && req.headers.authorization.length > 10) ? req.headers.authorization.split(' ')[1] : process.env.TOKEN_API_GIT;
        const message = req.body.message;
        const path = req.body.path;
        const repo = req.body.repo;
        const owner = req.body.owner;
        const sha = req.body.sha;

        let body = {    
            message,
            path,
            repo,
            owner,
            sha,
        }
        const file = await serviceGithub.deleteFile(access_token, body);
        res.status(200).send(file)
    } catch (error) {
        res.status(500).send({
            error: true,
            message: 'Not saved!',
            data: { error }
        })
        throw new Error(error);
    }
}

module.exports = {
    searchRepositoryOrgByUser,
    createRepositoryGithubAndUploadFiles,
    savePingWebHookEvent,
    getContentRepo,
    findAllRepo,
    detailRepo,
    repoOnlyUser,
    addLove,
    addComment,
    getComment,
    getChildComment,
    createFile,
    deleteFile
}