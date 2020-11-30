const express = require("express");
const router = express.Router();
const User = require("../models/User");
const adminCred = require("../U&P/admin.json");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
router.post(
  "/",
  [
    [
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password length should be graeter than 5").isLength({
        min: 6,
      }),
    ],
    auth,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status("400").json({ errors: errors.array() });
    }
    var { name, email, password, avatar_url } = req.body;
    const fields = {};
    fields.name = name;
    fields.email = email;
    fields.avatar_url = avatar_url;

    try {
      let user = await User.findOne({ email });
      if (user) {
        profile = await User.findOneAndUpdate(
          { email: user.email },
          { $set: fields },
          { new: true }
        );
        return res.json({ msg: "User Updated" });
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      fields.password = password;
      user = new User(fields);
      //   const salt = await bcrypt.genSalt(10);
      //   user.password = await bcrypt.hash(password, salt);
      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
        extra: {
          email: user.email,
        },
      };
      jwt.sign(
        payload,
        config.get("JWTSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          return res.json({ msg: "User created" });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(req.params.id);
      const user = await User.findById(req.params.id).select("-password");
      res.json(user);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
