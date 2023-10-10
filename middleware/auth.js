const jwt = require('jsonwebtoken')
const {secret} = require('./../config/app').jwt

module.exports = (req, res, next) => {
  const token = req.params.token
  try{
    const payload = jwt.verify(token, secret)
    if(payload.type !== "access"){
      res.json({message: "token invalid, no access"})
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
  next()
}
