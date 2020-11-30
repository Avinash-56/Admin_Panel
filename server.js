const express = require('express')
const connectDB = require('./config/db')


const app = express()

connectDB()

app.use(express.json({
    extended: false
}))

const PORT = process.env.PORT || 5000

app.get('/', (req,res)=>res.send('API Running'))

// app.use('/admin', require('./admin'))

app.use('/api/auth/', require('./routes/auth'))

app.use('/api/loan/', require('./routes/loan'))

app.use('/api/user/', require('./routes/user'))


app.listen(PORT, ()=> console.log(`Server started on Port ${PORT}`))