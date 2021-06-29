const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    .then(db => console.log(`DB is connected ${db}`))
    .catch(err => console.log(`Catch error ${err}`));