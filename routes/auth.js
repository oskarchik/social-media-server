const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

//TODO --- error messages need to be changed to more generic message

router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'all fields are mandatory' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = await new User({
      email,
      username,
      password: hash,
    });
    await newUser.save();
    return res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'all fields are mandatory' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: 'user not found' });
    }
    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'invalid password' });
    }
    return res.status(200).json({ user: existingUser });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
router.get('/', (req, res) => {
  res.send('hello from auth');
});

module.exports = router;
