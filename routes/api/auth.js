const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Copied from users.js -- the 4 below
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Reducing redundacy instead of req.body.email etc

    const { email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials'
            }
          ]
        });
      }

      // Matching the user and the password using bcrypt compare function

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: 'Invalid credentials'
            }
          ]
        });
      }
      //Return the json web token
      const payload = {
        user: {
          id: user.id // mongoose uses an abstraction so you dont have to use _id which is how it shows on mongoDB
        }
      };

      //signing with webtoken, made inside of the config default
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
