// const tokens = require("./../app/controllers/tokens")
const guid = require("guid")
const mongoose = require('mongoose')
const Token = require('./../app/models/token')
const User = require('./../app/models/user')
const helpers = require('./../helpers/helpers_token')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {secret} = require('./../config/app').jwt


module.exports = (app) => {
  app.get('/', async (req, res) => {
    const user = new User({
      userId: guid.create()
    })
    await user.save((err) => {
      if(err) return console.log(err)
      res.json({guid: user.userId})
    })
  })
  // curl -X POST -d 'guid=9052c032-f5ee-5daf-6473-8442f74e3eb3' localhost:4000/give_me_token
  app.post('/give_me_token', async (req, res) => {
    const {guid} = req.body
    if(!guid){
      res.json({message: "not in the request body guid"})
    }else{
      const user = await User.findOne({userId: guid})
      if(user){
        const accessToken = helpers.generateAccessToken(user.userId)
        const refreshToken = helpers.generateRefreshToken()
        try{
          const token = await Token.findOne({userId: user.userId})
          if(token){
            res.json({message: "токен для такого пользователя уже есть"})
          }else{
            helpers.createTokenInDb(refreshToken.tokenId.value, user.userId)
            res.json({
              accessToken,
              refreshToken: refreshToken.refreshToken,
              refreshTokenId: refreshToken.tokenId
            })
          }
        }catch(e){
          console.log(e)
        }
      }else{
        res.json({message: "no user with this guid"})
      }
    }
  })

  app.get('/valid_token/:token', async (req, res) => {
    res.json({
      message: 'token is valid, uraa!'
    })
  })
  // curl -X POST -d 'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZGJiMmIwYTktMzA5MC1mYWJkLTgyMTgtYjZjYjZjODUyNzUxIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE2OTY5NDI0NDIsImV4cCI6MTY5Njk0NDI0Mn0.9l4ECKPc2_sR127CwXZQmc2-rW-VZ7db527VEjogs20' localhost:4000/refresh
  app.post('/refresh', async (req, res) => {
    const {refreshToken} = req.body
    if(!refreshToken){
      res.json({message: "not in the request body refresh Token"})
    }
    let payload;
    try{
      payload = jwt.verify(refreshToken, secret)
      if(payload.type !== "refresh"){
        res.json({message: "token invalid, no refresh"})
        return;
      }
    }catch(e){
      console.log(e)
      if(e instanceof jwt.JsonWebTokenError){
        res.json({message: "token expired"})
        return;
      }
      if(e instanceof jwt.TokenExpiredError){
        res.json({message: "token invalid"})
        return;
      }
    }
    console.log(payload)
    try{
      const token = await helpers.findToken(payload.data)
      console.log(token)
      await Token.findOneAndRemove({ userId: token.userId })
      const accessToken = helpers.generateAccessToken(token.userId)
      const refreshToken = helpers.generateRefreshToken()
      helpers.createTokenInDb(refreshToken.tokenId.value, token.userId)
      res.json({
        accessToken,
        refreshToken: refreshToken.refreshToken,
      })
    }catch(e){
      console.log(e)
    }
  })
}

