const express = require("express");
const axios = require('axios');
const PORT = process.env.PORT || 5000
const CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY || ""
const app = express()

app.get('/', (req, res) => {
  var body = 'Hello World';
  if (req.query.access_token) {
    body += '<br>'
    body += req.query.access_token
  }
  res.send(body)
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
    const accessToken = response.data.code
    res.redirect(`/?access_token=${accessToken}`)
  }).catch((error) => {
    res.send(error)
  })
})

app.get('/oauth/finish', (req, res) => {
  res.send(req.query)
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
