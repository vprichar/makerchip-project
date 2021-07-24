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
        let community_newest_projects = {};
        if (req.headers.authorization && req.headers.authorization.length > 10) {
            const access_token = req.headers.authorization.split(' ')[1];
            const user = await serviceGithub.getDataUserGithub(access_token);
            if (user) {
                const data = {
                    name: user.name,
                    avatar_url: user.avatar_url,
                    bio: user.bio,
                    followers: user.followers,
                    following: user.following,
                    public_repos: user.public_repos
                }
                community_newest_projects = await serviceGithub.getReposByOrganization(access_token);
                if (community_newest_projects) {
                    res.status(200).send({ community_newest_projects });
                } else {
                    res.status(200).send({
                        error: false,
                        message: 'Repository',
                        data: {}
                    })
                }
            }
        }
        else {
            console.log('Entro a sin token');
            community_newest_projects = await serviceGithub.getRepoMongo();
            if (community_newest_projects) {
                res.status(200).send({ community_newest_projects });
            } else {
                res.status(200).send({
                    error: false,
                    message: 'Repository',
                    data: {}
                })
            }

        }

    } catch (error) {
        throw new Error(error);
    }
}

const createRepositoryGithubAndUploadFiles = async (req, res) => {
    try {
        const access_token = req.headers.authorization.split(' ')[1];
        const repos = await serviceGithub.getReposByOrganization(access_token);
        if (repos) {
            const repoReduce = repos.map(repo => {
                let response = {};
                response['name'] = repo.name;
                response['full_name'] = repo.full_name;
                response['stars'] = repo.stargazers_count;
                response['watchers'] = repo.watchers_count;
                response['clone_url'] = repo.clone_url;
                return response;

            }, {});
            const response = {};
            response['user'] = data;
            response['repositorys'] = repoReduce;
            res.status(200).send({
                error: false,
                message: 'Repository',
                data: response
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
    console.log(req.body)
    try {
        const saved = await webhookService.saveResponseFromGithub(req, res);
        console.log(saved)
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
}