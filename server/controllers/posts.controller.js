const Post = require('../models/post.model');
const fs = require('fs');
const User = require('../models/user.model');

exports.createPost = (req, res) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });

    User.findOne({ _id: req.userData.userId }).then(user => {
        if (user) {
            post.save().then(createdPost => {
                res.status(201).json({
                    message: 'Post added successfully',
                    post: {
                        ...createdPost,
                        id: createdPost._id
                    }
                })
            }).catch(e => {
                console.log(e)
                res.status(500).json({
                    message: 'Creating a post failed!'
                })
            });
        } else {
            res.status(404).json({message: 'User not found!'})
        }
    });
}

exports.updatePost = (req, res) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get("host");
        imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath,
        creator: req.userData.userId
    });

    Post.updateOne({_id: req.params.id, creator: req.userData.userId}, post).then(result => {
        if (result.matchedCount > 0) {
            res.status(200).json({
                message: 'Post updated successful',
            });
        } else {
            res.status(401).json({
                message: 'Not authorized!',
            });
        }
    })
        .catch(e => {
            console.log(e);
            res.status(500).json({
                message: "Couldn't update post"
            });
        });
}

exports.getPosts = (req, res) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const postQuery = Post.find().sort({ isPinned: 'desc' }).populate('comments').populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
    }).populate('creator', 'username');
    let fetchedPosts;
    if (pageSize && currentPage) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery
        .then(documents => {
            fetchedPosts = documents;
            return Post.count();
        })
        .then(count => {
            res.status(200).json({
                message: "Posts fetched successfully!",
                posts: fetchedPosts,
                postsCount: count
            });
        })
        .catch(e => {
            console.log(e);
            res.status(500).json({
                message: 'Fetching posts failed!'
            })
        });
}

exports.getPost = (req, res) => {
    Post.findById(req.params.id).populate('comments').then(post => {
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({message: 'Post not found!'})
        }
    })
        .catch(e => {
            console.log(e);
            res.status(500).json({
                message: 'Fetching post failed!'
            })
        });
}

exports.deletePost = (req, res) => {
    const filePath = `./images/${req.params.filename}`;
    let creator;
    if (req.body.creator !== req.userData.userId && req.userData.roles.includes('ADMIN')) {
        creator = req.body.creator;
    } else {
        creator = req.userData.userId
    }

    Post.deleteOne({_id: req.params.id, creator }).then(result => {
        if (result.deletedCount > 0) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    res.status(500).json({
                        error: 'Failed to delete the image'
                    });
                }
            });
            res.status(200).json({message: 'Post deleted successfully'})
        } else {
            res.status(401).json({
                message: 'Not authorized!',
            });
        }
    })
        .catch(e => {
            console.log(e)
            res.status(500).json({
                message: 'Deleting post failed!'
            })
        });
}

exports.pinPost = (req, res) => {
        Post.findOneAndUpdate({_id: req.body.id}, {isPinned: req.body.postPinnedStatus}, { new: true }).then(pinnedPost => {
            if (!pinnedPost) {
                res.status(500).json({
                    message: 'Invalid post'
                });
            }
            res.status(201).json({
                message: 'Post pinned successfully',
                post: {
                    ...pinnedPost,
                    id: pinnedPost._id
                }
            })
        }).catch(e => {
            console.log(e)
            res.status(500).json({
                message: 'Post pinning failed!'
            })
        });
}