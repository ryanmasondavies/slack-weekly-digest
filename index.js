const express = require("express");
const axios = require('axios');
const PORT = process.env.PORT || 5000
const CONSUMER_KEY = process.env.POCKET_CONSUMER_KEY || ""
const DOMAIN = "https://tranquil-beach-30466.herokuapp.com"
const app = express()

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  
  return array;
}

app.get('/', (req, res) => {
  if (req.query.access_token) {
    res.send(`Welcome, ${req.query.username}. Token: ${req.query.access_token}`)
  } else {
    res.send('Hello World')
  }
})

function getTalksFromPocket(accessToken) {
  return axios({
    method: 'get',
    url: `https://getpocket.com/v3/get?consumer_key=${CONSUMER_KEY}&access_token=${accessToken}&state=all&tag=talk&sort=newest&detailType=simple`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

function getArticlesFromPocket(accessToken) {
  return axios({
    method: 'get',
    url: `https://getpocket.com/v3/get?consumer_key=${CONSUMER_KEY}&access_token=${accessToken}&tag=digest&state=all&contentType=article&sort=newest&detailType=simple`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

app.get('/api/digest', (req, res) => {
  const accessToken = req.query.access_token
  axios.all([
    getTalksFromPocket(accessToken), getArticlesFromPocket(accessToken)
  ]).then(axios.spread(function(talksResponse, articlesResponse) {
    const allTalks = Object.keys(talksResponse.data.list).map(function(key) {
      return talksResponse.data.list[key];
    });
    const allArticles = Object.keys(articlesResponse.data.list).map(function(key) {
      return articlesResponse.data.list[key];
    });
    const talks = shuffle(allTalks).slice(0,3)
    const articles = shuffle(allArticles).slice(0,3)
    console.log("Articles:")
    console.log(talks)
    console.log("Talks:")
    console.log(articles)
    var message = "*Talks:*\n\n"
    talks.forEach(function(talk) {
      message += `- ${talk.resolved_title}: ${talk.resolved_url}\n`
    })
    message += "\n*Articles:*\n\n"
    articles.forEach(function(article) {
      message += `- ${article.resolved_title}: ${article.resolved_url}\n`
    })
    res.send(message)
  })).catch((error) => {
    console.log('Encountered error');
    console.log(error);
    res.send(error)
  })
})

app.post('/api/publish', (req, res) => {
  const accessToken = process.env.POCKET_ACCESS_TOKEN
  axios.get(`${DOMAIN}/api/digest?access_token=${accessToken}`).then(function(response) {
    console.log('Got response from digest API:')
    console.log(response)
    const data = {"text": response.data}
    console.log('Message to be published:')
    console.log(data)
    axios({
      method: 'post',
      url: process.env.SLACK_ENDPOINT,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {"text": response.data}
    }).then(function(response) {
      res.send("Successfully published message to Slack.")
    }).catch(function(error) {
      console.log('Encountered error publishing to Slack.')
      console.log(error)
      res.send(error)
    })
  }).catch(function(error) {
    console.log('Encountered error reading from digest API.')
    res.send(error)
  })
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
    console.log(`Response:`);
    console.log(response);
    console.log("Redirecting user to Pocket...");
    const redirectURI = encodeURI(`${DOMAIN}/oauth/finish?code=${response.data.code}`)
    res.redirect(`https://getpocket.com/auth/authorize?request_token=${response.data.code}&redirect_uri=${redirectURI}`)
  }).catch((error) => {
    console.log('Encountered error');
    console.log(error);
    res.send(error)
  })
})

app.get('/oauth/finish', (req, res) => {
  console.log(`OAuth finish: ${req}`)
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
