const Post = require('../models/post.model');
const fs = require('fs');

exports.createPost = (req, res) => {
    const url = req.protocol + '://' + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });
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
                message: 'Update successful',
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
    const postQuery = Post.find().sort({ isPinned: 1 }).populate('comments');
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
    if (req.body.creator !== req.userData.userId && !req.userData.roles.includes('ADMIN')) {
        creator = '';
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
            res.status(200).json({message: 'Post deleted'})
        } else {
            res.status(401).json({
                message: 'Not authorized!',
            });
        }
    })
        .catch(e => {
            console.log(e);
            res.status(500).json({
                message: 'Deleting post failed!'
            })
        });
}

exports.pinPost = async (req, res) => {
    try {
        const post = await Post.findById({_id: req.body.id});
        if (!post) {
            res.status(500).json({
                message: 'Invalid post'
            });
        }
        post.isPinned = true;

        await post.save();

        res.status(201).json({
            message: 'Post pinned successfully',
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Post pinning failed!'
        })
    }
}