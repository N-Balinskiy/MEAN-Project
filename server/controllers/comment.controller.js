const Comment = require('../models/comment.model');
const Post = require('../models/post.model');

exports.addComment = async (req, res) => {
    try {
        const comment = await Comment.create({
            text: req.body.text,
            post: req.params.id,
            author: req.userData.userId
        });

        const post = await Post.findById({ _id: req.params.id });
        if (!post) {
            res.status(500).json({
                message: "Post doesn't exist"
            });
        }

        post.comments.push(comment);

        await post.save();
        res.status(201).json({
            message: 'Comment added successfully',
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Creating a comment failed!'
        })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        let author;
        console.log(req.body)
        if (req.body.author !== req.userData.userId && !req.userData.roles.includes('ADMIN')) {
            author = req.body.author;
        } else {
            author = req.userData.userId
        }

        await Post.updateOne({ _id: req.params.id }, {
            $pullAll: {
                comments: [{_id: req.body.commentId, author }]
            }
        });

        const result = await Comment.deleteOne({_id: req.body.commentId, author});
        if (result.deletedCount > 0) {
            res.status(200).json({message: 'Comment deleted'})
        } else {
            res.status(401).json({
                message: 'Not authorized!',
            });
        }
    } catch(e) {
        console.log(e);
        res.status(500).json({
            message: 'Deleting comment failed!'
        })
    }
}

exports.editComment = async (req, res) => {
    try {
        if (req.body.author !== req.userData.userId) {
            res.status(401).json({
                message: 'Not authorized!',
            });
        }

        const comment = await Comment.findById({_id: req.body.commentId});

        if (!comment) {
            res.status(500).json({
                message: "Comment doesn't exist"
            });
        }

        comment.text = req.body.text;

        await comment.save();
        res.status(201).json({
            message: 'Comment edited successfully',
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            message: 'Editing comment failed!'
        })
    }
}