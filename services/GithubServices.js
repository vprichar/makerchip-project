const fetch = require('node-fetch');
const _ = require('lodash');
const RepositoryMC = require("../models/RepositoryMC")
const mongoose = require('mongoose');


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
        console.log(params);

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

const findAllRepoMC = async (token) => {
    try {
        let resp = await RepositoryMC.find({});
        return resp;
    } catch (error) {
        throw new Error(error);
    }
}


const getRepoMongo = async () => {
    try {
        const resp = await RepositoryMC.find({}, { _id: 0, __v: 0 });
        let salida = _.uniqWith(resp, _.isEqual);
        return await updateRepos(salida);
    } catch (error) {
        throw new Error(error);
    }
}

const updateRepos = async (repos) => {
    try {
        onlyMC = [];
        for (const repo of repos) {
            const request = await fetch(`${process.env.API_URL_GITHUB}/repositories/${repo.id}`, {
                headers: {
                    'Authorization': `token ${process.env.TOKEN_API_GIT}`
                }

            });
            let resp = await request.json();
            const owner = resp.owner.login;
            const repoName = resp.name;

            const requestContent = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/makerchip`, {
                headers: {
                    'Authorization': `token ${process.env.TOKEN_API_GIT}`
                }
            });
            let respContent = await requestContent.json();
            let thumbExists = _.find(respContent, data => {
                return data.name.indexOf(".png") >= 0;
            });
            repo.thumbUrl = (thumbExists) ? thumbExists.download_url : '';
            let response = {};
            response['thumbnail_url'] = repo.thumbUrl;
            response['title'] = repoName;
            response['creator'] = owner;
            response['type'] = 'project';
            response['id'] = repo.id;
            response['love_count'] = repo.love_count;
            response['stars'] = resp.stargazers_count;
            const query = { id: resp.id };
            await RepositoryMC.findOneAndUpdate(query, response, { upsert: true });
            onlyMC.push(response);
        }
        return onlyMC;
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
                return data.name == 'makerchip.json';
            });
            if (exists) {
                const requestContent = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/makerchip`, {
                    headers: {
                        'Authorization': `token ${token}`
                    }
                });
                let respContent = await requestContent.json();
                let thumbExists = _.find(respContent, data => {
                    return data.name.indexOf(".png") >= 0;
                });
                repo.thumbUrl = (thumbExists) ? thumbExists.download_url : 'Imagen no disponible';

                let response = {};
                response['thumbnail_url'] = repo.thumbUrl;
                response['title'] = repo.name;
                response['creator'] = repo.owner.login;
                response['type'] = 'project';
                response['id'] = repo.id;
                response['love_count'] = 0;
                response['stars'] = repo.stargazers_count;
                //response['clone_url'] = repo.clone_url;
                const query = { id: repo.id };
                await RepositoryMC.findOneAndUpdate(query, response, { upsert: true });
                onlyMC.push(response);
            }
        }
        let todoRepo = await findAllRepoMC(token);
        let output = [];
        if (todoRepo) {
            output = todoRepo.map((repo) => {
                return {
                    thumbnail_url: repo.thumbnail_url,
                    title: repo.title,
                    creator: repo.creator,
                    type: repo.type,
                    id: repo.id,
                    love_count: repo.love_count,
                    stars: repo.stars,
                };
            });
        }
        let salida = _.uniqWith(output, _.isEqual);
        return salida;
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

const detailRepo = async (id, token) => {
    try {
        const request = await fetch(`${process.env.API_URL_GITHUB}/repositories/${id}`, {
            headers: {
                'Authorization': `token ${process.env.TOKEN_API_GIT}`
            }

        });
        let resp = await request.json();
        const owner = resp.owner.login;
        const repoName = resp.name;

        const requestContent = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/makerchip`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        let respContent = await requestContent.json();
        let thumbExists = _.find(respContent, data => {
            return data.name.indexOf(".png") >= 0;
        });
        const thumbUrl = (thumbExists) ? thumbExists.download_url : 'Imagen no disponible';
        const parent = (resp.parent) ? resp.parent.node_id : 'Parent no disponible'
        let respMap = {
            "id": id,
            "title": repoName,
            "description": resp.description,
            "instructions": "",
            "visibility": "visible",
            "public": true,
            "comments_allowed": true,
            "is_published": true,
            "author": {
                "id": 61943259,
                "username": owner,
                "scratchteam": false,
                "history": {
                    "joined": resp.updated_at
                },
                "profile": {
                    "id": resp.owner.id,
                    "images": {
                        "90x90": resp.owner.avatar_url,
                        "60x60": resp.owner.avatar_url,
                        "55x55": resp.owner.avatar_url,
                        "50x50": resp.owner.avatar_url,
                        "32x32": resp.owner.avatar_url
                    }
                }
            },
            "image": thumbUrl,
            "images": {
                "282x218": thumbUrl,
                "216x163": thumbUrl,
                "200x200": thumbUrl,
                "144x108": thumbUrl,
                "135x102": thumbUrl,
                "100x80": thumbUrl
            },
            "history": {
                "created": resp.created_at,
                "modified": resp.updated_at,
                "shared": resp.pushed_at
            },
            "stats": {
                "views": resp.watchers,
                "loves": 200,
                "favorites": 300,
                "remixes": 90
            },
            "remix": {
                "parent": parent,
                "root": null
            }

        };
        return respMap;
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
    getContentRepoMC,
    findAllRepoMC,
    getRepoMongo,
    updateRepos,
    detailRepo
}