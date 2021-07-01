const fetch = require('node-fetch');
const _ = require('lodash');


const getAccessToken = async (
    code,
    client_id,
    client_secret) => {
    try {
        const request = await fetch(`${process.env.URL_LOGIN_GITHUB}/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code
            })
        });
        const text = await request.text();
        const params = new URLSearchParams(text);
        return params.get('access_token');
    } catch (error) {
        throw new Error(error);
    }
}

const getDataUserGithub = async (token) => {
    try {
        const request = await fetch(`${process.env.API_URL_GITHUB}/user`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        return await request.json();
    } catch (error) {
        throw new Error(error);
    }

}

const getOrganizationsByUser = async (token) => {
    try {
        console.log(token)
        const request = await fetch(`${process.env.API_URL_GITHUB}/orgs/${process.env.API_ORG_EXAMPLE}/members/ichavezf`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        return await request.json();
    } catch (error) {
        throw new Error(error);
    }

}

const getReposByOrganization = async (token) => {
    try {
        console.log(token)
        const request = await fetch(`${process.env.API_URL_GITHUB}/user/repos`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        const allRepo = await request.json();
        console.log(allRepo.length);

        return await getContentRepoMC(allRepo, token);
    } catch (error) {
        throw new Error(error);
    }
}

const getContentRepoMC = async (repos, token) => {
    try {
        onlyMC = [];

        for (const repo of repos) {
            const owner = repo.owner.login;
            const repoName = repo.name;
            const request = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/`, {
                headers: {
                    'Authorization': `token ${token}`
                }
            });
            let resp = await request.json();
            let exists = _.find(resp, data => {
                console.log(data.name);
                return data.name == '.makerchip.json';
            });
            if (exists) { // es un proyecto MC
                console.log(exists);
                onlyMC.push(repo);
            }
        }
        return onlyMC;
    } catch (error) {
        throw new Error(error);
    }
}

const getContentRepo = async (owner, repoName, token) => {
    try {
        console.log(token);
        const request = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        return await request.json();
    } catch (error) {
        throw new Error(error);
    }
}


const createRepoAndUploadFilesByUserWithTokenAuth = async (token) => {
    try {
        console.log(token)
        const request = await fetch(`${process.env.API_URL_GITHUB}/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': `application/vnd.github.v3+json`,
                'X-OAuth-Scopes': `repo, user`,
                'X-Accepted-OAuth-Scopes': `user`
            },
            body: JSON.stringify(data)
        });
        return await request.json();
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getAccessToken,
    getDataUserGithub,
    getOrganizationsByUser,
    getReposByOrganization,
    createRepoAndUploadFilesByUserWithTokenAuth,
    getContentRepo,
    getContentRepoMC

}