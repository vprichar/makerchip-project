if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const cookies = require('cookie-session');
const app = new express();
const conf = require('./package.json');
const loginRoutes = require('./routes/LoginRoutes');
const githubRoutes = require('./routes/GithubRoutes');

const db = require('./config/Database');



const {
    ERROR_NOT_FOUND_PAGE
} = require('./utils/Constants')

const corsOptions = {
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'contentType', 'Content-Type', 'Accept', 'Authorization','x-access-token'],
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(express.text());
app.use(cookies({
    name:'session',
    secret: process.env.SECRET_WORD_COOKIE
}))

app.use('/api', loginRoutes);
app.use('/api', githubRoutes);


app.get('/', (req, res) => {
    const config1 = conf;
    delete config1.bugs;
    delete config1.homepage;
    delete config1.repository;
    delete config1.dependencies;
    delete config1.devDependencies;
    delete config1.prettier;
    delete config1.keywords;
    delete config1.scripts;
    delete config1.main;
    res.send(config1);
});


app.get('*', (req, res) => {
    const message = ERROR_NOT_FOUND_PAGE;

    res.status(404).send({
        error: true,
        message: message
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server on port http://localhost:${process.env.PORT}`);
});