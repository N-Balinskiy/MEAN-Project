const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Post = require("./models/post");

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.post('/api/posts', (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added successfully',
            postId: createdPost._id
        })
    });

});
// PALuK9I2HNWQFbWn

app.get('/api/posts', (req, res) => {
    Post.find()
        .then(documents => {
            res.status(200).json({
                message: 'Posts fetched successfully!',
                posts: documents
            });
        });
});

app.delete('/api/posts/:id', (req, res) => {
    Post.deleteOne({ _id: req.params.id }).then(result => {
        console.log(result);
        res.status(200).json({ message: 'Post deleted' });
    });
})

module.exports = app;