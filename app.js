require('dotenv').config()
const { CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_SECRET } = process.env
const Twit = require('twit')
const T = new Twit({
  consumer_key:         CONSUMER_KEY,
  consumer_secret:      CONSUMER_SECRET,
  access_token:         ACCESS_TOKEN,
  access_token_secret:  ACCESS_SECRET
})

async function getData() {
  const data = await T.get('search/tweets', { q: 'alex+smith', count: 100 })
  console.log(data)
}

getData()

