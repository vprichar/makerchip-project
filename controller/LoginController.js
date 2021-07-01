const serviceGithub = require('../services/GithubServices');
const webhookService = require('../services/WebHookEventService');

const {
    USER_GITHUB_FOUND,
    ERROR_LOGIN_NOT_AUTH
} = require('../utils/Constants');

const makeLoginWithGithub = async (req, res) => {
    try {
        const redirect_uri = `${process.env.PUBLIC_URL_DNS}/api/callback`;
        console.log(redirect_uri)
        console.log(`${process.env.URL_LOGIN_GITHUB}/authorize?client_id=${process.env.API_GITHUB_ID}&redirect_uri=${redirect_uri}`)
        res.send({
            error: false,
            message: 'Authorization',
            data: `${process.env.URL_LOGIN_GITHUB}/authorize?client_id=${process.env.API_GITHUB_ID}&redirect_uri=${redirect_uri}&scope=repo,admin:repo_hook&public_repo`
        });
    } catch (error) {
        throw new Error(error);
    }
}

const makeLogOutEraseToken = async (req, res) => {
    try {
        if (req.session.access_token !== null) {
            req.session = null;
            res.status(200).send({
                error: false,
                message: 'Iniciar session',
                data: `${process.env.FRONT_URL_DNS}`
            })
        }
    } catch (error) {
        throw new Error(error);
    }
}

const searchAccessTokenGithubWithCode = async (req, res) => {
    try {
        const code = req.query.code;
        const githubId = process.env.API_GITHUB_ID;
        const githubSecret = process.env.API_GITHUB_SECRET;
        console.log(code)
        const access_token = await serviceGithub.getAccessToken(
            code,
            githubId,
            githubSecret,
        );
        console.log(access_token)
        const user = await serviceGithub.getDataUserGithub(access_token);
        if (user) {
            res.redirect(`${process.env.FRONT_URL_DNS}dashboard.html?token=${access_token}`)
        } else {
            res.status(403).send({
                error: true,
                message: ERROR_LOGIN_NOT_AUTH
            });
        }
    } catch (error) {
        throw new Error(error);
    }
}

const searchRepositoryOrgByUser = async (req, res) => {
    try {
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

module.exports = {
    makeLoginWithGithub,
    searchAccessTokenGithubWithCode,
    searchRepositoryOrgByUser,
    makeLogOutEraseToken,
    createRepositoryGithubAndUploadFiles,
    savePingWebHookEvent,
    getContentRepo
}