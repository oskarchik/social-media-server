const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  console.log('controller req.file', req);
  console.log('controller body', req.body);
  const { text, userId } = req.body;
  const mentions = JSON.parse(req.body.mentions);
  const image = req.file_url;
  const ids = mentions?.map((mention) => mention.id);

  if (!text && !image) {
    return res.status(400).json({ error: 'text or image is needed' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found to associate post' });
    }
    const newPost = await new Post({
      userId: user._id,
      text,
      image,
      mentions,
    }).populate('userId');
    const savedPost = await newPost.save();
    const updateUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { posts: savedPost._id } },

      { new: true }
    );
    const mentionedUsers = await User.updateMany(
      { _id: { $in: [ids] } },
      {
        $push: { mentions: user },
      },
      { new: true }
    );
    return res.status(200).json({ post: newPost, user: updateUser });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const postUpdate = async (req, res) => {
  const postId = req.params.id;
  const { userId, text } = req.body;
  const image = req.file_url;
  const fieldsToUpdate = {};
  if (image) {
    fieldsToUpdate.image = image;
  }
  if (text) {
    fieldsToUpdate.text = text;
  }
  try {
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!existingPost.userId.equals(userId)) {
      return res.status(403).json({ error: `You cannot update someone else's post` });
    }
    const updatePost = await Post.findByIdAndUpdate(
      existingPost._id,
      {
        $set: { ...fieldsToUpdate },
      },
      { new: true }
    );

    const updatedPost = await Post.findById(postId).populate('comments').populate('userId').populate('likes');

    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(500).json({ error: 'internal server error' });
  }
};

const postDelete = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({
        error: `post doesn't exists`,
      });
    }
    if (!existingPost.userId.equals(userId)) {
      return res.status(403).json({ error: `You can not delete someone else's post` });
    }
    const deletedPost = await Post.findByIdAndDelete(postId);

    return res.status(200).json({ msg: 'Post deleted', postId });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

const postGetById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ error: 'post not found' });
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
};

const postsUserGetAll = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(404).json({ error: 'user not found' });
  }
  try {
    const user = await User.findById(id).populate({ path: 'posts', populate: { path: 'userId' } });

    const userPosts = user.posts;
    if (!userPosts || userPosts.length < 1) {
      return res.status(200).json({ message: 'User does not have any post published' });
    }

    return res.status(200).json(userPosts);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const timeLineByIdUserGet = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    const userPosts = await Post.find({ userId: user._id })
      .populate({ path: 'userId' })
      .populate({ path: 'comments', populate: 'userId comments' })
      .populate({ path: 'postRef' });
    const friendsPosts = await Promise.all(
      user.contacts.map((contactId) => {
        return Post.find({ userId: contactId })
          .populate({
            path: 'userId',
            populate: {
              path: 'posts',
            },
          })
          .populate({ path: 'comments', populate: 'userId comments likes' })
          .populate({ path: 'likes', populate: 'userId' });
      })
    );

    const timeline = [...userPosts, ...friendsPosts].flat().sort((a, b) => b.updatedAt - a.updatedAt);

    return res.status(200).json(timeline);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const postLikeByIdPut = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  if (!postId) {
    return res.status(400).json({ error: 'Post id needed' });
  }

  try {
    const existingPost = await Post.findById(postId);

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
      )
        .populate('comments')
        .populate('userId')
        .populate('likes');
      return res.status(200).json(likedPost);
    }
    if (existingPost.likes.includes(userId)) {
      const unLikedPost = await Post.findByIdAndUpdate(
        existingPost._id,
        {
          $pull: {
            likes: userId,
          },
        },
        { new: true }
      )
        .populate('comments')
        .populate('userId')
        .populate('likes');
      return res.status(200).json(unLikedPost);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

const sharePost = async (req, res) => {
  const { postRef, userId, text } = req.body;

  if (!postRef && !userId) {
    return res.status(400).json({ error: 'User and post ids needed' });
  }
  try {
    const existingPost = await Post.findById(postRef);

    if (!existingPost) {
      return res.status(400).json({ error: 'Post not found' });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(400).json({ error: 'User not found' });
    }

    const newPost = await new Post({
      userId: existingUser._id,
      text,
      postRef: existingPost._id,
    });

    const savedPost = await newPost.save();

    const updatedUser = await User.findByIdAndUpdate(
      existingUser._id,
      {
        $push: {
          shares: savedPost._id,
        },
      },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};
module.exports = {
  createPost,
  postUpdate,
  postDelete,
  postGetById,
  postsUserGetAll,
  timeLineByIdUserGet,
  postLikeByIdPut,
  sharePost,
};
