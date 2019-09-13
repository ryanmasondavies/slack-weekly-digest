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
    url: `https://getpocket.com/v3/get?consumer_key=${CONSUMER_KEY}&access_token=${accessToken}&tag=ios%20talk&sort=newest&detailType=simple`,
    headers: {
      'X-Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

function getArticlesFromPocket(accessToken) {
  return axios({
    method: 'get',
    url: `https://getpocket.com/v3/get?consumer_key=${CONSUMER_KEY}&access_token=${accessToken}&tag=digest&contentType=article&sort=newest&detailType=simple`,
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
    const talks = shuffle(allTalks).slice(0,5)
    const articles = shuffle(allArticles).slice(0,5)
    console.log("Articles:")
    console.log(talks)
    console.log("Talks:")
    console.log(articles)
    var message = "*Talks:*\n\n"
    message += talks.map(function(talk) {
      return `- ${talk.resolved_title}: ${talk.resolved_url}\n`
    })
    message += "\n*Articles:*"
    message += articles.map(function(article) {
      return `- ${article.resolved_title}: ${article.resolved_url}\n`
    })
    res.send(message)
  })).catch((error) => {
    console.log('Encountered error');
    console.log(error);
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
