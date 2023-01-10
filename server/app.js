const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const postsRoutes = require("./routes/posts");

const app = express();

mongoose.set('strictQuery',true);
mongoose.connect("mongodb+srv://Desonancen:PALuK9I2HNWQFbWn@cluster0.zsqfhdp.mongodb.net/node-angular?retryWrites=true&w=majority")
    .then(() => {
        console.log('Connected to db');
    })
    .catch(()=> {
        console.log('Connection blocked');
    })

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

app.use('/api/posts', postsRoutes);

module.exports = app;