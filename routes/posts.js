const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

//create post
router.post('/', async (req, res) => {
  const { description, image, userId } = req.body;
  if (!description || !image) {
    return res.status(400).json({ error: 'description or image is needed' });
  }
  try {
    const newPost = await new Post({
      userId,
      description,
      image,
    });
    const savedPost = await newPost.save();
    const user = await User.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'user not found to associate post' });
    }
    const updateUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { posts: savedPost._id } },

      { new: true }
    );
    return res.status(200).json({ post: newPost, user: updateUser });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

//update post
router.put('/:id', async (req, res) => {
  const postId = req.params.id;
  const { userId, image, description } = req.body;
  try {
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!existingPost.userId.equals(userId)) {
      return res.status(403).json({ error: `You cannot update someone else's post` });
    }
    if (image !== undefined) {
      const updatePost = await Post.findByIdAndUpdate(
        existingPost._id,
        {
          $set: {
            image,
          },
        },
        { new: true }
      );
      if (description !== undefined) {
        const updatePost = await Post.findByIdAndUpdate(
          existingPost._id,
          {
            $set: {
              description,
            },
          },
          { new: true }
        );
      }
    }
    const updatedPost = await Post.findById(postId);
    return res.status(200).json({ post: updatedPost });
  } catch (error) {
    return res.status(500).json({ error: 'internal server error' });
  }
});
//delete post
router.delete('/:id', async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        error: `post doesn't exisits`,
      });
    }
    if (!existingPost.userId.equals(userId)) {
      return res.status(403).json({ error: `You can not delete someone else's post` });
    }
    const deletedPost = await Post.findByIdAndDelete(postId);
    console.log(deletedPost);
    return res.status(200).json({ msg: 'Post deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'internal server error' });
  }
});

// get post
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ error: 'user not found' });
  }
  try {
    const post = await Post.findById(id).populate({
      path: 'userId',
      select: { _id: 1, firstName: 1, lastName: 1, email: 1, avatar: 1, coverPic: 1, followers: 1, following: 1 },
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//get timeline by userId
router.get('/:id/timeline/all', async (req, res) => {
  const userId = req.params.id;
  console.log(req.params.id);
  console.log(userId);
  try {
    const user = await User.findById(userId);
    console.log(user);
    const userPosts = await Post.find({ userId: user._id });
    const friendsPosts = await Promise.all(
      user.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    const timeline = [...userPosts, ...friendsPosts].flat().sort((a, b) => b.updatedAt - a.updatedAt);

    return res.status(200).json(timeline);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// like post
router.put('/:id/likes', async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: 'Post id needed' });
  }
  let existingPost;
  try {
    existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!existingPost.likes.includes(userId)) {
      const likedPost = await Post.findByIdAndUpdate(
        existingPost._id,
        {
          $push: {
            likes: userId,
          },
        },
        { new: true }
      );
      return res.status(200).json({ msg: 'Post has been liked' });
    }
    if (existingPost.likes.includes(userId)) {
      const likedPost = await Post.findByIdAndUpdate(
        existingPost._id,
        {
          $pull: {
            likes: userId,
          },
        },
        { new: true }
      );
      return res.status(200).json({ msg: 'Post has been unliked' });
    }
  } catch (error) {}
});

module.exports = router;