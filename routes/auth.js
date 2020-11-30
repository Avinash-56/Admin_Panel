const express = require("express");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const router = express.Router();
const adminCred = require("../U&P/admin.json");
const agentCred = require("../U&P/agent.json");
const User = require('../models/User')
const auth = require('../middleware/auth')


router.put("/", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  var user;
  const { type } = req.body;

  const noPassword = ({ password, ...rest }) => rest;
  try {

    if (type == "Cand") {
      user = await User.findById(req.user.id).select("-password");
      console.log(user);
    }
    if (type == "Agent") {
      agentCred.map((agent) => {
        if (agent.email == req.extra.email) user = noPassword(agent);
      });
    }

    if (type == "Admin") {
      adminCred.map((admin) => {
        console.log("3555779")
        if (admin.email == req.extra.email) user = noPassword(admin);
      });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("server Error");
  }
});

  
router.post(
  "/admin-login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const adminLen = adminCred.length;

    const { email, password } = req.body;
    var c = 0;

    for (var i = 0; i < adminCred.length; i++) {
      cre = adminCred[i];
      if (c === 1) break;
      // if (cre.email !== email && adminLen==i+1) {
      //      return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
      // }
      // if (cre.password !== password && adminLen==i+1 ) {
      //   return res.status(400).json({ errors: [{ msg: "Invalid Credentials" }] });
      //  }
        if (
        i == adminLen - 1 &&
        (cre.email != email ||
        cre.password != password)
      ) {
        res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      else if (cre.email == email && cre.password == password) {
        c = c + 1;
        const payload = {
          user: {
            id: cre.id,
          },
          extra:{
              email: cre.email
          }
        };

        jwt.sign(
          payload,
          config.get("JWTSecret"),
          {
            expiresIn: 360000,
          },
          (err, token) => {
            if (err) throw err;
            return res.json({ token });
          }
        );
      }
    }
  }
);

router.post(
    "/agent-login",
    [
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password is required").exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      const agentLen = agentCred.length;
  
      const { email, password } = req.body;
      var c = 0;
  
      for (var i = 0; i < agentCred.length; i++) {
        cre = agentCred[i];
        if (c === 1) break;
          if (
          i == agentLen - 1 &&
          (cre.email != email ||
          cre.password != password)
        ) {
          res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
        }
  
        else if (cre.email == email && cre.password == password) {
          c = c + 1;
          const payload = {
            user: {
              id: cre.id,
            },
            extra:{
                email: cre.email
            }
          };
  
          jwt.sign(
            payload,
            config.get("JWTSecret"),
            {
              expiresIn: 360000,
            },
            (err, token) => {
              if (err) throw err;
              return res.json({ token });
            }
          );
        }
      }
    }
  );

  router.post(
    "/",
    [
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password is required").exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }
  
        if (user.password !== password) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }
  
        const payload = {
          user: {
            id: user.id,
          },
          extra:{
              email: user.email
          }
        };
  
        jwt.sign(
          payload,
          config.get("JWTSecret"),
          {
            expiresIn: 360000,
          },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    }
  );






module.exports = router;
