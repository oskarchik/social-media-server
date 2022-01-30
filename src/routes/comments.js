const router = require('express').Router();

const {
  createCommentPost,
  updateCommentPut,
  removeCommentDelete,
  likeCommentPut,
  getCommentById,
  getAllComments,
  commentACommentPut,
} = require('../controllers/comment.controller');

//create comment
//update comment
//delete comment
//like comment
//unlike comment
//get comment
// get all comments
//comment a comment
//________done till here

router.post('/:id', createCommentPost);

router.put('/:id', updateCommentPut);

router.delete('/:id', removeCommentDelete);

router.put('/:id/like-comment', likeCommentPut);

router.get('/:id', getCommentById);

router.get('/', getAllComments);

router.put('/:id/comment', commentACommentPut);

module.exports = router;
