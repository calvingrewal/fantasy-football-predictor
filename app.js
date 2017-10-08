require('dotenv').config()
const { CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_SECRET } = process.env
const express = require('express')
const players = require('./players')
const Twit = require('twit')

const T = new Twit({
  consumer_key:         CONSUMER_KEY,
  consumer_secret:      CONSUMER_SECRET,
  access_token:         ACCESS_TOKEN,
  access_token_secret:  ACCESS_SECRET
})

const app = express()

async function getData(q, until) {
  const data = await T.get('search/tweets', { q, until, count: 100, result_type: 'popular'})
  return data
}

app.get('/', async (req, res) => {
  const { player, until } = req.query
  const data = await getData(player, until) 
  const tweets = data.data.statuses.map(tweet => ({
    text: tweet.text,
    id: tweet.id,
    date: tweet['created_at']
  }))

  return res.json({
    tweets
  })
})

app.get('/status', async (req, res) => {
  const status = await T.get('application/rate_limit_status', {resources:'search'})
  res.json(status)
})

app.listen(3000, () => {
  console.log('**********listening on port 3000**********')
})
