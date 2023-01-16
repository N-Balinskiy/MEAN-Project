const express = require("express");

const PostsController = require("../controllers/posts");

const checkAuth = require('../middlewares/check-auth');
const extractFile = require('../middlewares/file');

const router = express.Router();


router.post('', checkAuth, extractFile, PostsController.createPost);

router.put('/:id', checkAuth, extractFile, PostsController.updatePost);

router.get('', PostsController.getPosts);

router.get('/:id', PostsController.getPost);

router.delete('/:id', checkAuth, PostsController.deletePost); //TODO add deleting from disk storage by multer

module.exports = router;