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
        const origin = req.query.origin;

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

        console.log(user);
        if (origin == 'IDE') {
            res.redirect(`http://137.184.30.125:8080/sandbox?token=${access_token}`)
        } else {
            if (user.exits) {
                res.redirect(`${process.env.FRONT_URL_DNS}?token=${access_token}`)
            } else {
                res.redirect(`${process.env.PUBLIC_GITHUB_APP}`)
            }
        }
    } catch (error) {
        throw new Error(error);
    }
}


const callbackIDE = async (req, res) => {
    try {
        const code = req.query.code;
        const githubId = process.env.API_GITHUB_ID_IDE;
        const githubSecret = process.env.API_GITHUB_SECRET_IDE;
        const access_token = await serviceGithub.getAccessToken(
            code,
            githubId,
            githubSecret,
        );
        console.log(access_token);
        await serviceGithub.getDataUserGithub(access_token);
        // console.log(user);
        res.redirect(`http://137.184.30.125:8080/sandbox?token=${access_token}`)
    } catch (error) {
        throw new Error(error);
    }
}

const makeLoginWithGithubIDE = async (req, res) => {
    try {
        const redirect_uri = `${process.env.PUBLIC_URL_DNS}/api/callbackIDE`;
        console.log(redirect_uri)
        console.log(`${process.env.URL_LOGIN_GITHUB}/authorize?client_id=${process.env.API_GITHUB_ID_IDE}&redirect_uri=${redirect_uri}`)
        res.send({
            error: false,
            message: 'Authorization',
            data: `${process.env.URL_LOGIN_GITHUB}/authorize?client_id=${process.env.API_GITHUB_ID_IDE}&redirect_uri=${redirect_uri}&scope=repo,admin:repo_hook&public_repo`
        });
    } catch (error) {
        throw new Error(error);
    }
}



const callbackGithubApp = async (req, res) => {
    try {
        const code = req.query.code;
        const githubId = process.env.API_GITHUB_ID_APP;
        const githubSecret = process.env.API_GITHUB_SECRET_APP;
        console.log(code);
        const access_token = await serviceGithub.getAccessToken(
            code,
            githubId,
            githubSecret,
        );
        console.log(access_token);
        res.redirect(`${process.env.FRONT_URL_DNS}?token=${access_token}`)
    } catch (error) {
        throw new Error(error);
    }
}


module.exports = {
    makeLoginWithGithub,
    makeLogOutEraseToken,
    makeLoginWithGithubV2,
    searchAccessTokenGithubWithCode,
    callbackGithubApp,
    callbackIDE,
    makeLoginWithGithubIDE
}