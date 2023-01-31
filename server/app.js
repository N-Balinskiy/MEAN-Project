const path = require("path");
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts.router");
const userRoutes = require("./routes/user.router");

const app = express();

mongoose.set('strictQuery',true);
mongoose.connect("mongodb+srv://Desonancen:"+ process.env.MONGO_ATLAS_PW +"@cluster0.zsqfhdp.mongodb.net/node-angular?retryWrites=true&w=majority")
    .then(() => {
        console.log('Connected to db');
    })
    .catch(()=> {
        console.log('Connection blocked');
    })

app.use(bodyParser.json());
app.use('/images', express.static(path.join('images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

module.exports = app;