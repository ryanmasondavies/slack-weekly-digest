const express = require("express");
const axios = require('axios');
const PORT = process.env.PORT || 5000
const CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY || ""
const DOMAIN = "https://tranquil-beach-30466.herokuapp.com"
const app = express()

app.get('/', (req, res) => {
  if (req.query.access_token) {
    res.send(req.query.access_token)
  } else {
    res.send('Hello World')
  }
})

app.get('/oauth/redirect', (req, res) => {
  axios({
    method: 'post',
    url: `https://getpocket.com/v3/oauth/request?consumer_key=${CONSUMER_KEY}&redirect_uri=${DOMAIN}/oauth/finish`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    console.log(response)
    const requestToken = response.data.code
    const redirectURI = encodeURI(`${DOMAIN}/oauth/finish?code=${requestToken}`)
    console.log("Redirect to " + redirectURI)
    res.redirect(`https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirectURI}`);
  }).catch((error) => {
    res.send(error)
  })
})

app.get('/oauth/finish', (req, res) => {
  console.log(req)
  const requestToken = req.query.code
  axios({
    method: 'post',
    url: `https://getpocket.com/v3/oauth/authorize?consumer_key=${CONSUMER_KEY}&code=${requestToken}`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).catch((error) => {
    res.send(error)
  })
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
