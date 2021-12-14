const router = require('express').Router();
const {
  createPost,
  postUpdate,
  postDelete,
  postGetById,
  postsUserGetAll,
  timeLineByIdUserGet,
  postLikeByIdPut,
  sharePost,
} = require('../controllers/post.controller');

const { upload, uploadToCloudinary } = require('../middlewares/file.middleware');

router.put('/share', sharePost);

router.post('/', [upload.single('image'), uploadToCloudinary], createPost);

router.put('/:id', [upload.single('image'), uploadToCloudinary], postUpdate);

router.delete('/:id', postDelete);

router.get('/:id', postGetById);

router.get('/user-posts/:id', postsUserGetAll);

router.get('/:id/timeline/all', timeLineByIdUserGet);

router.put('/:id/likes', postLikeByIdPut);

module.exports = router;
