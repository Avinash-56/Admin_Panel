const mongoose = require('mongoose')

const loanSchema = new mongoose.Schema({
    createdBy: {
        type: String
    },
    tenure:{
        type: Number,
        required: true
    },
    interest: {
        type: Number,
        default: 5
    },
    state:{
        type: String,
        required: true
    },
  createdFor:{
    type: String,
    required: true
  },

  created_at: 
  { 
      type: Date, 
      default: Date.now()
  },
  updated_at: 
  {
       type: Date, 
       default: Date.now() 
  },
})

module.exports = Loan = mongoose.model('Loan', loanSchema)