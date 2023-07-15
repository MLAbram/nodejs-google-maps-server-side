const express = require('express')
const app = express()
// const { json } = require("body-parser")
const https = require('https')
const {Client} = require('@googlemaps/google-maps-services-js')
const geoip = require('geoip-lite')

require('dotenv').config()

app.use(express.json())

if (app.get('env') == 'production') {
  app.set('trust proxy', 1) // trust first proxy to detect correct ip
}

app.get('/', (req, res) => {
  return res.status(200).json({title: 'Using Gogole Maps (server-side) in Node.js'})
})

app.get('/elevation-html5/', (req, res) => {  
  const latVal = 30.2672
  const lngVal = -97.7431
  const client = new Client({})
  
  client
    .elevation({
      params: {
        locations: [{ lat: latVal, lng: lngVal }],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
  })
    .then((r) => {
      // console.log(r.data.results[0].elevation)
      return res.status(200).json({
        elevation: r.data.results[0].elevation,
        latitude: latVal,
        longitude: lngVal
      })
  })
    .catch((e) => {
      // console.log(e.response.data.error_message)
      return res.status(400).json({error: e.response.data.error_message})
  })
})

app.get('/elevation-ip/', (req, res) => {
  var myIP = ''

  if (app.get('env') === 'production') {
      myIP = req.ip
  } else {
      myIP = '8.8.8.8'
  }
  
  const geo = geoip.lookup(myIP)
  const client = new Client({})
  
  client
    .elevation({
      params: {
        locations: [{ lat: geo.ll[0], lng: geo.ll[1] }],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000, // milliseconds
  })
    .then((r) => {
      // console.log(r.data.results[0].elevation)
      return res.status(200).json({
        elevation: r.data.results[0].elevation,
        ip: myIP,
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      })
  })
    .catch((e) => {
      // console.log(e.response.data.error_message)
      return res.status(400).json({error: e.response.data.error_message})
  })
})

app.get('/elevation-static/', (req, res) => {
  const client = new Client({})

  client
    .elevation({
      params: {
        locations: [{ lat: 30.2672, lng: -97.7431 }],
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