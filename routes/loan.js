const express = require("express");
const { check, validationResult } = require("express-validator");
const Loan = require("../models/Loan");
const User = require("../models/User");
const router = express.Router();
const agentCred = require("../U&P/agent.json");
const adminCred = require('../U&P/admin.json')
const auth = require("../middleware/auth");


router.get('/me', auth, async (req,res)=>{
  const {email} = req.extra
  try {
    const loans = await Loan.find({createdFor: email })
    res.json(loans)
  } catch (err) {
    console.error(err)
    res.status(500).send("Server Error");
}
})

router.post(
  "/",
  [
    [
      check("tenure", "Tenure is required").exists(),
      check("state", "State is required").exists(),
      check("createdFor", "Email of the user required").isEmail(),
    ],
    auth,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).json({ erros: errors.array() });
    const agentLen = agentCred.length;
    console.log(req.extra);
    const id = parseInt(req.user.id);
    console.log(agentCred[id].email);
    if (req.extra.email !== agentCred[id].email) {
      res
        .status(401)
        .json({ errors: [{ msg: "Only agent allowed to add loans" }] });
    } else if (agentCred[id].email == req.extra.email) {
      const { tenure, interest, state, createdFor, email } = req.body;
      const user = await User.findOne({ email: req.body.createdFor });
      if (!user)
        return res.status(401).json({ errors: [{ msg: "User not found" }] });
      const newLoan = new Loan({
        tenure,
        interest,
        state,
        createdFor,
        createdBy: req.extra.email,
      });
      const loan = await newLoan.save();
      res.json(loan);
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    console.log('Im here')
    const loans = await Loan.find().sort({ date: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.put("/state/:id", [[
check('state',"State is required").exists()
], auth], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) res.status(400).json({ erros: errors.array() });

    const id = req.user.id

    const {state} = req.body
    const setState = {
        state
    }
    if (req.extra.email !== adminCred[id].email) {
        res
          .status(401)
          .json({ errors: [{ msg: "Only Admins allowed to change state of loans" }] });
      }
  try {
        const loan = await Loan.findOneAndUpdate({
            _id: req.params.id},
            {$set: setState},
            {new: true}

        )
        res.json(loan._id)


  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


router.put("/:id", auth , async (req, res) => {
        
    
        const id = req.user.id
        const loanEdits = {}
        const {createdFor, tenure, interest} = req.body 
        
        if (createdFor) loanEdits.createdFor = createdFor
        if (tenure) loanEdits.tenure = tenure
        if (interest) loanEdits.interest = interest 


        if (req.extra.email !== agentCred[id].email) {
            res
              .status(401)
              .json({ errors: [{ msg: "Only Agents allowed to edit loans" }] });
          }
      try {
            const loan = await Loan.findOneAndUpdate({
                _id: req.params.id},
                {$set: loanEdits},
                {new: true}
    
            )
            res.json(loan)
    
    
      } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
      }
    });

router.delete('/:id', auth, async (req,res)=>{
    id = req.user.id
    console.log(id)
    if (req.extra.email !== agentCred[id].email) {
        console.log("Hello")
        res
          .status(401)
          .json({ errors: [{ msg: "Only Agents allowed to edit loans" }] });
      }

      try {
          const loan = await Loan.findOneAndRemove({_id: req.params.id})
          return res.json({msg: "Loan deleted"})
          
      } catch (err) {
          console.error(err)
          res.status(500).send("Server error")
      }
})    

module.exports = router;
