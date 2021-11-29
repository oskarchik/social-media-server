const Comment = require('../models/Comment');
const User = require('../models/User');
const Post = require('../models/Post');

const createCommentPost = async (req, res) => {
  const { text, postId } = req.body;
  const userId = req.params.id;
  if (!text) {
    return res.status(400).json({ error: 'text and user is needed' });
  }
  if (!userId && !postId) {
    return res.status(400).json({ error: 'user  or post are needed to associate comment' });
  }
  try {
    let updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $inc: {
          totalComments: 1,
        },
      },
      {
        new: true,
      }
    );
    const newComment = await new Comment({
      userId: req.params.id,
      postId,
      text,
    });

    if (!newComment) {
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $inc: {
            totalComments: -1,
          },
        },
        {
          new: true,
        }
      );
    }
    const user = await User.findById(req.params.id);
    const post = await Post.findById(postId);
    if (!user) {
      return res.status(400).json({ error: 'user  not found to associate comment' });
    }
    if (!user.contacts.includes(post.userId) && !post.userId.equals(req.params.id)) {
      return res
        .status(403)
        .json({ error: 'Post owner has to be in your contacts or you should be the owner of the post' });
    }

    if (!post) {
      return res.status(400).json({ error: 'post  not found to associate comment' });
    }

    const savedComment = await newComment.save();

    updatedPost = await Post.findByIdAndUpdate(
      post._id,
      {
        $push: { comments: savedComment._id },
      },
      { new: true }
    ).populate('comments');
    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const updateCommentPut = async (req, res) => {
  const commentId = req.params.id;
  const { userId, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'New text needed' });
  }
  if (!userId || !commentId) {
    return res.status(400).json({ error: 'Need id of user and comment' });
  }
  try {
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (!existingComment.userId.equals(userId)) {
      return res.status(403).json({ error: `You cannot update someone else's comment` });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      existingComment._id,
      {
        $set: {
          text,
        },
      },
      { new: true }
    );
    // console.log(updatedComment);
    return res.status(200).json({ comment: updatedComment });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const removeCommentDelete = async (req, res) => {
  const commentId = req.params.id;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Owner comment id needed' });
  }
  try {
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const existingPost = await Post.findById(existingComment.postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post ref not found' });
    }
    if (!existingComment.userId.equals(userId)) {
      return res.status(403).json({ error: `You can not delete someone else's comment` });
    }
    const deletedComment = await Comment.findByIdAndDelete(existingComment._id);

    const updatedPost = await Post.findByIdAndUpdate(
      existingPost._id,
      {
        $inc: {
          totalComments: -1,
        },
      },
      { new: true }
    ).populate('comments');
    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
};

const likeCommentPut = async (req, res) => {
  const commentId = req.params.id;
  const { userId } = req.body;

  if (!commentId) {
    return res.status(400).json({ error: 'Comment id needed' });
  }
  if (!userId) {
    return res.status(400).json({ error: 'User id needed' });
  }
  try {
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const existingPost = await Post.findById(existingComment.postId).populate('comments');
    if (!existingPost) {
      return res.status(404).json({ error: 'Post ref not found' });
    }

    if (!existingComment.likes.includes(userId)) {
      const likedComment = await Comment.findByIdAndUpdate(
        existingComment._id,
        {
          $push: {
            likes: userId,
          },
        },
        { new: true }
      );

      console.log(likedComment);

      const updatedPost = await Post.findById(existingComment.postId).populate('comments');

      return res.status(200).json(updatedPost);
    }
    if (existingComment.likes.includes(userId)) {
      const likedComment = await Comment.findByIdAndUpdate(
        existingComment._id,
        {
          $pull: {
            likes: userId,
          },
        },
        { new: true }
      );
      console.log(likedComment);

      const updatedPost = await Post.findById(existingComment.postId).populate('comments');

      return res.status(200).json(updatedPost);
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const getCommentById = async (req, res) => {
  const commentId = req.params.id;
  if (!commentId) {
    return res.status(400).json({ error: 'Comment id needed' });
  }
  try {
    const existingComment = await Comment.findById(commentId)
      .populate('userId')
      .populate('likes')
      .populate('subComments');
    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    return res.status(200).json({ comment: existingComment });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const getAllComments = async (req, res) => {
  try {
    const existingComments = await Comment.find().populate('userId').populate('likes').populate('subComments');
    if (!existingComments) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    return res.status(200).json({ comments: existingComments });
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const commentACommentPut = async (req, res) => {
  const commentId = req.params.id;
  const { userId, text } = req.body;
  if (!commentId || !userId) {
    return res.status(400).json({ error: 'Comment and user id needed' });
  }
  if (!text) {
    return res.status(400).json({ error: 'Text needed to comment' });
  }
  try {
    const existingComment = await Comment.findById(commentId).populate('userId').populate('likes').populate('comments');

    if (!existingComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const existingPost = await Post.findByIdAndUpdate(
      existingComment.postId,
      {
        $inc: {
          totalComments: +1,
        },
      },
      {
        new: true,
      }
    );
    const newSubComment = await new Comment({
      userId,
      postId: existingComment.postId,
      text,
      isSubComment: true,
    });
    if (!newSubComment) {
      await Post.findByIdAndUpdate(
        existingComment.postId,
        {
          $inc: {
            totalComments: -1,
          },
        },
        { new: true }
      );
    }
    const savedNewSubComment = await newSubComment.save();
    let updatedComment = await Comment.findByIdAndUpdate(
      existingComment._id,
      {
        $push: {
          comments: savedNewSubComment,
        },
        $set: {
          hasSubComments: true,
        },
      },
      { new: true }
    )
      .populate('userId')
      .populate('likes')
      .populate('comments');

    const updatedPost = await Post.findById(existingPost._id).populate('comments');
    console.log(updatedPost);
    // return res.status(200).json({ sourceComment: updatedComment, newComment: savedNewSubComment });
    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = {
  createCommentPost,
  updateCommentPut,
  removeCommentDelete,
  likeCommentPut,
  getCommentById,
  getAllComments,
  commentACommentPut,
};
