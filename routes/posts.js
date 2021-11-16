const router = require('express').Router();
const {
  createPost,
  postUpdate,
  postDelete,
  postGetById,
  timeLineByIdUserGet,
  postLikeByIdPut,
} = require('../controllers/post.controller');

router.post('/', createPost);

router.put('/:id', postUpdate);

router.delete('/:id', postDelete);

router.get('/:id', postGetById);

router.get('/:id/timeline/all', timeLineByIdUserGet);

router.put('/:id/likes', postLikeByIdPut);

module.exports = router;
