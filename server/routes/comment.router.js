const express = require("express");

const CommentsController = require("../controllers/comment.controller");

const checkAuth = require('../middlewares/check-auth');

const router = express.Router();

router.post('/:id', checkAuth, CommentsController.addComment);
router.delete('/:id', checkAuth, CommentsController.deleteComment);
router.put('/:id', checkAuth, CommentsController.editComment);

module.exports = router;