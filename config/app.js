module.exports =  {
  jwt: {
    secret: "secret",
    tokens: {
      access: {
        type: "access",
        time: '2m'
      },
      refresh: {
        type: "refresh",
        time: '30m'
      }
    }
  }
}