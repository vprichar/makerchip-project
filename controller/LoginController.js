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


const makeLoginWithGithubV2 = async (req, res) => {
    try {

        res.send({
            error: false,
            message: 'Authorization',
            data: `https://github.com/apps/proyecta2`
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
        console.log(access_token);
        const user = await serviceGithub.getDataUserGithub(access_token);
        const saveRepo = await serviceGithub.getDataUserGithub(access_token);

        if (user) {
            res.redirect(`${process.env.FRONT_URL_DNS}?token=${access_token}`)
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


module.exports = {
    makeLoginWithGithub,
    makeLogOutEraseToken,
    makeLoginWithGithubV2,
    searchAccessTokenGithubWithCode
}