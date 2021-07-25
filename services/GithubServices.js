const fetch = require('node-fetch');
const _ = require('lodash');
const RepositoryMC = require("../models/RepositoryMC");
const loveCount = require("../models/loveCount");
const Comment = require("../models/Comment");
const User = require("../models/User");


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
        console.log("USER params", params);



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
        const gitUser = await request.json();
        const queryFind = { idUser: gitUser.id }

        await User.find(queryFind);
        const user = {
            userName: gitUser.login,
            idUser: gitUser.id,
            token
        };
        await User.findOneAndUpdate(queryFind, user, { upsert: true })
        await saveRepos(token);
        return gitUser;
    } catch (error) {
        throw new Error(error);
    }
}


const getReposByOrganization = async () => {
    try {
        const allRepo = await RepositoryMC.find();
        let output = [];
        output = allRepo.map((repo) => {
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

        let salida = _.uniqWith(output, _.isEqual);
        return salida;
    } catch (error) {
        throw new Error(error);
    }
}

const getRepos = async (token) => {
    try {
        const request = await fetch(`${process.env.API_URL_GITHUB}/user/repos`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });

        return await request.json();
    } catch (error) {
        throw new Error(error);
    }
}

const getReposById = async (id) => {
    try {
        const request = await fetch(`${process.env.API_URL_GITHUB}/repositories/${id}`, {
            headers: {
                'Authorization': `token ${process.env.TOKEN_API_GIT}`
            }
        });

        return await request.json();
    } catch (error) {
        throw new Error(error);
    }
}

const getContent = async (owner, repoName, token) => {
    try {
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

const getThumb = async (owner, repoName, token) => {
    try {
        const requestContent = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/makerchip`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        return await requestContent.json();
    } catch (error) {
        throw new Error(error);
    }
}

const getReadme = async (owner, repoName, token) => {
    try {
        const requestReadme = await fetch(`${process.env.API_URL_GITHUB}/repos/${owner}/${repoName}/contents/README.md`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        let respReadme = await requestReadme.json();
        const readme = (respReadme) ? Buffer.from(respReadme.content, 'base64').toString() : 'Readme no disponible';
        return readme;
    } catch (error) {
        throw new Error(error);
    }
}


const updateRepoMongo = async (idRepo, token) => {
    try {
        console.log("Entre a updatear REPO desde un webHook");
        let repo = await getReposById(idRepo);
        const owner = repo.owner.login;
        const repoName = repo.name;
        const ownerId = repo.owner.id;
        const avatarOwner = repo.owner.avatar_url;
        let response = {};
        const contentRepo = await getContent(owner, repoName, token);
        let exists = _.find(contentRepo, data => {
            return data.name == 'makerchip.json';
        });

        if (exists) {
            const readme = await getReadme(owner, repoName, token);
            const parent = (repo.parent) ? repo.parent.node_id : 'Parent no disponible'
            const findThumb = await getThumb(owner, repoName, token);
            let thumbExists = _.find(findThumb, data => {
                return data.name.indexOf(".png") >= 0;
            });
            repo.thumbUrl = (thumbExists) ? thumbExists.download_url : '';
            const query = { id: repo.id }
            let [respMongo] = await RepositoryMC.find(query);
            let love_count = (respMongo) ? respMongo.love_count : 0;
            response['thumbnail_url'] = repo.thumbUrl;
            response['title'] = repoName;
            response['creator'] = owner;
            response['description'] = repo.description;
            response['type'] = 'project';
            response['id'] = repo.id;
            response['love_count'] = love_count;
            response['stars'] = repo.stargazers_count;
            response['avatarOwner'] = avatarOwner;
            response['ownerId'] = ownerId;
            response['readme'] = readme;
            response['parent'] = parent;
            response['created_atRepo'] = repo.created_at;
            response['watchers'] = repo.watchers;
            await RepositoryMC.findOneAndUpdate(query, response, { upsert: true });
        }
        console.log("Sali de updatear REPO desde un webHook");
        return response;
    } catch (error) {
        throw new Error(error);
    }
}

const saveRepos = async (token) => {
    try {
        let respMc = [];
        let repos = await getRepos(token);
        for (const repo of repos) {
            const owner = repo.owner.login;
            const repoName = repo.name;
            const ownerId = repo.owner.id;
            const avatarOwner = repo.owner.avatar_url;
            const contentRepo = await getContent(owner, repoName, token);
            let exists = _.find(contentRepo, data => {
                return data.name == 'makerchip.json';
            });

            if (exists) {
                const readme = await getReadme(owner, repoName, token);
                const parent = (repo.parent) ? repo.parent.node_id : 'Parent no disponible'
                const findThumb = await getThumb(owner, repoName, token);
                let thumbExists = _.find(findThumb, data => {
                    return data.name.indexOf(".png") >= 0;
                });
                repo.thumbUrl = (thumbExists) ? thumbExists.download_url : '';
                let response = {};
                const query = { id: repo.id }
                let [respMongo] = await RepositoryMC.find(query);
                let love_count = (respMongo) ? respMongo.love_count : 0;
                response['thumbnail_url'] = repo.thumbUrl;
                response['title'] = repoName;
                response['creator'] = owner;
                response['description'] = repo.description;
                response['type'] = 'project';
                response['id'] = repo.id;
                response['love_count'] = love_count;
                response['stars'] = repo.stargazers_count;
                response['avatarOwner'] = avatarOwner;
                response['ownerId'] = ownerId;
                response['readme'] = readme;
                response['parent'] = parent;
                response['created_atRepo'] = repo.created_at;
                response['watchers'] = repo.watchers;

                respMc.push(response);
                await RepositoryMC.findOneAndUpdate(query, response, { upsert: true });
            }
        }
        return respMc;
    } catch (error) {
        throw new Error(error);
    }
}

const addRemoveLove = async (id, token) => {
    try {
        const [respMongoLove] = await loveCount.find({ idRepo: id, idToken: token });
        let resp = {};
        if (respMongoLove) {
            let [respMongoRepo] = await RepositoryMC.find({ id: id });
            respMongoRepo.love_count--;
            console.log(respMongoRepo.love_count);
            const query = { id: id };
            await loveCount.remove({ idRepo: id, idToken: token });
            await RepositoryMC.findOneAndUpdate(query, respMongoRepo, { upsert: true })
            resp = {
                count: respMongoRepo.love_count,
                loving: false,
            };
            return resp;
        }
        else {
            let [respMongoRepo] = await RepositoryMC.find({ id: id });
            respMongoRepo.love_count++;
            console.log(respMongoRepo.love_count);
            const query = { id: id };
            const qsave = { idRepo: id, idToken: token };
            const loveCountRegister = new loveCount(qsave);
            await loveCountRegister.save();
            await RepositoryMC.findOneAndUpdate(query, respMongoRepo, { upsert: true })
            resp = {
                count: respMongoRepo.love_count,
                loving: true,
            };
            return resp;
        }
    } catch (error) {
        throw new Error(error);
    }
}

const findAllRepoMC = async (filter) => {
    try {
        let resp = await RepositoryMC.find(filter);
        return resp;
    } catch (error) {
        throw new Error(error);
    }
}

const repoOnlyUser = async (token) => {
    try {
        const respUser = await User.find({ token });
        const resp = await RepositoryMC.find({ ownerId: respUser.idUser });

        let output = [];
        output = resp.map((repo) => {
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

        let salida = _.uniqWith(output, _.isEqual);
        return salida;
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
        const [findRepo] = await RepositoryMC.find({ id: id });

        let respMap = {
            "id": id,
            "title": findRepo.title,
            "description": findRepo.description,
            "instructions": findRepo.readme,
            "visibility": "visible",
            "public": true,
            "comments_allowed": true,
            "is_published": true,
            "author": {
                "id": findRepo.ownerId,
                "username": findRepo.creator,
                "scratchteam": false,
                "history": {
                    "joined": findRepo.updated_at
                },
                "profile": {
                    "id": findRepo.ownerId,
                    "images": {
                        "90x90": findRepo.avatarOwner,
                        "60x60": findRepo.avatarOwner,
                        "55x55": findRepo.avatarOwner,
                        "50x50": findRepo.avatarOwner,
                        "32x32": findRepo.avatarOwner
                    }
                }
            },
            "image": findRepo.thumbnail_url,
            "images": {
                "282x218": findRepo.thumbnail_url,
                "216x163": findRepo.thumbnail_url,
                "200x200": findRepo.thumbnail_url,
                "144x108": findRepo.thumbnail_url,
                "135x102": findRepo.thumbnail_url,
                "100x80": findRepo.thumbnail_url
            },
            "history": {
                "created": findRepo.created_atRepo,
                "modified": findRepo.updated_at,
                "shared": findRepo.updated_at
            },
            "stats": {
                "views": findRepo.watchers,
                "loves": findRepo.love_count,
                "favorites": 300,
                "remixes": 90
            },
            "remix": {
                "parent": findRepo.parent,
                "root": null
            }

        };
        console.log('FIN service');
        return respMap;

    } catch (error) {
        console.log(error);
        next(error);
    }
}

const addComment = async (idRepo, token, parent_id, content) => {
    try {
        let [repos] = await getRepos(token);
        const comment = {
            idRepo,
            idToken: token,
            content,
            parent_id,
            visibility: 'visible',
            author: {
                id: repos.owner.id,
                username: repos.owner.login,
                image: repos.owner.avatar_url,
            },
            reply_count: 0
        };

        const commentSave = new Comment(comment);
        return await commentSave.save();
    } catch (error) {
        throw new Error(error);
    }
}

const getComment = async (idRepo) => {
    try {
        const comments = await Comment.find({ idRepo: idRepo }, { __v: 0 });
        const output = comments.map((comment) => {
            return {
                parent_id: comment.parent_id,
                commentee_id: comment._id,
                content: comment.content,
                datetime_created: comment.createdAt,
                datetime_modified: comment.updatedAt,
                visibility: comment.visibility,
                author: comment.author,
                reply_count: comment.reply_count
            };
        });
        return output;
    } catch (error) {
        throw new Error(error);
    }
}


module.exports = {
    getAccessToken,
    getDataUserGithub,
    getReposByOrganization,
    createRepoAndUploadFilesByUserWithTokenAuth,
    getContentRepo,
    findAllRepoMC,
    getRepoMongo,
    detailRepo,
    saveRepos,
    repoOnlyUser,
    addRemoveLove,
    addComment,
    getComment,
    updateRepoMongo,
    getReadme
}