const express = require('express')
const app = express()
// const { json } = require("body-parser")
const https = require('https')
const {Client} = require('@googlemaps/google-maps-services-js')

require('dotenv').config()

app.use(express.json())

app.get('/', (req, res) => {
  return res.status(200).json({title: 'Using Gogole Maps (server-side) in Node.js'})
})

app.get('/elevation-static/', (req, res) => {
  const client = new Client({})

  client
    .elevation({
      params: {
        locations: [{ lat: 45, lng: -110 }],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
  })
    .then((r) => {
      // console.log(r.data.results[0].elevation)
      return res.status(200).json({elevation: r.data.results[0].elevation})
  })
    .catch((e) => {
      // console.log(e.response.data.error_message)
      return res.status(400).json({error: e.response.data.error_message})
  })
})

app.listen(3000, () => {
  console.log('Server listening on port: 3000.')
})