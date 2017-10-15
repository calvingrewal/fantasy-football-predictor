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
app.get('/', (req, res) => {
  res.redirect('/tweets')
})
app.get('/scrape', async (req, res) => {
  for (let i = 0;i < players.length; i++) {
    const player = players[i]
    const until = '2017-10-15'

    const data = await getData(player, until) 
    const tweets = data.data.statuses.map(tweet => ({
      text: tweet.text,
      id: tweet.id,
      date: tweet['created_at']
    }))

    const filename = 'tweets2.json'
    
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        console.log('error reading tweets json', err)
      } else {
        existing = data.length ? JSON.parse(data) : {}
        existing[player] = {
          lastFetched: Date.now(),
          tweets
        }

        json = JSON.stringify(existing)
        fs.writeFile(filename, json, 'utf8', (err, data) => {
          if (err) console.log('error writing to tweets json', err)
        })
      }
    }) 
  }
  res.json({
    success: '?'
  })
})

app.get('/tweets', (req, res) => {
  fs.readFile('tweets2.json', 'utf8', (err, data) => {
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
