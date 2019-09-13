const express = require("express");
const axios = require('axios');
const PORT = process.env.PORT || 5000
const CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY || ""
const DOMAIN = "https://tranquil-beach-30466.herokuapp.com"
const app = express()

app.get('/', (req, res) => {
  if (req.query.access_token) {
    res.send(`Welcome, ${req.query.username}. Token: ${req.query.access_token}`)
  } else {
    res.send('Hello World')
  }
})

app.get('/oauth/redirect', (req, res) => {
  axios({
    method: 'post',
    url: `https://getpocket.com/v3/oauth/request?consumer_key=${CONSUMER_KEY}&redirect_uri=${encodeURI(DOMAIN + '/oauth/finish')}`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    console.log("Redirecting user to Pocket...")
    console.log(response)
    res.redirect(`https://getpocket.com/auth/authorize?consumer_key=${requestToken}&code=${response.data.code}`);
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
  }).then((response) => {
    res.redirect(`/?access_token=${response.data.access_token}&username=${response.data.username}`)
  }).catch((error) => {
    res.send(error)
  })
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
