const express = require('express')
const app = express()
const guid = require('guid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const {error} = require('console')
const { type } = require('os')
const bodyParser = require('body-parser')
const auth = require('./middleware/auth')

const Token = require('./app/models/token')

app.use(bodyParser.urlencoded({extend: false}))
app.use(bodyParser.json())
app.use('/valid_token/:token', auth)

require("./routes/routes")(app)

function start(){
  try{
    return new Promise((res, rej) => {
      const mongo = mongoose.connect('mongodb://localhost:27017/auth', {useUnifiedTopology: true, useNewUrlParser: true})
      if(mongo){
        console.log()
        res("Connected to database")
      }else{
        rej(error)
      }
    }).then((response) => {
      console.log(response)
      app.listen(4000, () => { 
        console.log("hello api")
      })
    })
      .catch((err) => {
        console.log(err)
      })
  }catch(err){
    console.log(err)
  }
}

start()