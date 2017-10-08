require('dotenv').config()
const { CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_SECRET } = process.env
const express = require('express')
const fs = require('fs')
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
  if (!q || !until) {
    throw new Error('No query or until date provided')
    return
  }
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
  fs.readFile('tweets.json', 'utf8', (err, data) => {
    if (err) {
      console.log('error reading tweets json', err)
    } else {
      existing = data.length ? JSON.parse(data) : {}
      existing[player] = {
        lastFetched: Date.now(),
        tweets
      }

      json = JSON.stringify(existing)
      fs.writeFile('tweets.json', json, 'utf8', (err, data) => {
	if (err) console.log('error writing to tweets json', err)
      })
    }
  }) 
  return res.json({
    tweets
  })
})

app.get('/tweets', (req, res) => {
  fs.readFile('tweets.json', 'utf8', (err, data) => {
    json = JSON.parse(data)
    res.json(json)
  })
})

app.get('/status', async (req, res) => {
  const status = await T.get('application/rate_limit_status', {resources:'search'})
  res.json(status)
})

app.listen(3000, () => {
  console.log('**********listening on port 3000**********')
})
