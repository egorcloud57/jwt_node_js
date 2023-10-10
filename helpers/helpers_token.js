const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Token = require("./../app/models/token")
const User = require("./../app/models/user")
const config = require("./../config/app")
const guid = require('guid')
const bcrypt = require('bcrypt')

const generateAccessToken = (userId) => {
  const accessToken = jwt.sign(
    {data: userId, type: config.jwt.tokens.access.type},
    config.jwt.secret,
    {expiresIn: config.jwt.tokens.access.time}
  )
  return accessToken
}

const generateRefreshToken = () => {
  const tokenId = guid.create()
  const refreshToken = jwt.sign(
    {data: tokenId, type: config.jwt.tokens.refresh.type},
    config.jwt.secret,
    {expiresIn: config.jwt.tokens.refresh.time}
  )
  return {
    refreshToken,
    tokenId
  }
}

const findToken = async (tokenId) => {
  // const token = await Token.findOne({tokenId: payload.data})
  const tokens = await Token.find()
  const token = tokens.find(async (obj) => {
    await bcrypt.compare(tokenId, obj.tokenId)
  })
  return token
}

const createTokenInDb = async (refreshTokenId, userId) => {
  const salt = 10 
  try{
    const hashToken = await bcrypt.hash(refreshTokenId, salt)
    const token = await Token.create({tokenId: hashToken, userId: userId})
    console.log("токен успешно создан")
    return;
  }catch(e){
    console.log(e)
  }
}


module.exports = {
  generateAccessToken,
  generateRefreshToken,
  createTokenInDb,
  findToken
}