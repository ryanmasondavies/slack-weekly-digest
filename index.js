const express = require("express");
const axios = require('axios');
const PORT = process.env.PORT || 5000
const CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY || ""
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
  if (req.query.access_token != nil) {
    res.send(req.query.access_token)
  }
})

app.get('/oauth/redirect', (req, res) => {
  const requestToken = req.query.code
  axios({
    method: 'post',
    url: `https://getpocket.com/v3/oauth/request?consumer_key=${CONSUMER_KEY}&redirect_uri=https://tranquil-beach-30466.herokuapp.com/oauth/finish`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    console.log(response)
    const accessToken = response.data.token
    res.redirect(`/?access_token=${accessToken}`)
  }).catch((error) => {
    res.send(error)
  })
})

app.get('/oauth/finish', (req, res) => {
  res.send(req.query)
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
