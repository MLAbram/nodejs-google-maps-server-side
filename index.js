// npm run dev
// 
// https://stackoverflow.com/questions/38601678/getting-lat-and-lng-from-users-browser-node-js-express
// https://stackoverflow.com/questions/38214549/sending-html5-geolocation-results-back-to-node-express-server
// https://stackoverflow.com/questions/20012977/how-to-use-node-js-in-a-real-time-gps-tracking-application
// https://developers.google.com/maps/documentation/places/web-service#example-apps
// 

const express = require('express')
const app = express()
// const { json } = require("body-parser")
// const server = require('http').createServer(app);
const http = require('http');
const server = http.createServer(app);
const { Client } = require('@googlemaps/google-maps-services-js')
const geoip = require('geoip-lite')
const io = require('socket.io')(server)

require('dotenv').config()

io.on('connection', (socket) => {
  socket.on('latlng', (latlng) => {
    // console.log('lat: ' + latlng.lat + '\nlng: ' + latlng.lng)

    const client = new Client({})  
    client
      .elevation({
        params: {
          locations: [{ lat: latlng.lat, lng: latlng.lng }],
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 1000, // milliseconds
    })
      .then((r) => {
        console.log(r.data.results[0].elevation)
        // return res.status(200).json({
        //   elevation: r.data.results[0].elevation,
        //   ip: myIP,
        //   latitude: latlng.lat,
        //   longitude: latlng.lng
        // })
    })
      .catch((e) => {
        console.log(e.response.data.error_message)
        // return res.status(400).json({error: e.response.data.error_message})
    })
  });
});

app.use(express.json())

if (app.get('env') == 'production') {
  app.set('trust proxy', 1) // trust first proxy to detect correct ip
}

app.get('/', (req, res) => {
  return res.status(200).json({ title: 'Using Gogole Maps (server-side) in Node.js' })
})

app.get('/elevation-html5/', async(req, res) => {
  // const client = new Client({})  
  // client
  //   .elevation({
  //     params: {
  //       // locations: [{ latlng }],
  //       locations: [{ lat: latlng[0], lng: latlng[1] }],
  //       key: process.env.GOOGLE_MAPS_API_KEY,
  //     },
  //     timeout: 1000, // milliseconds
  // })
  //   .then((r) => {
  //     // console.log(r.data.results[0].elevation)
  //     return res.status(200).json({
  //       elevation: r.data.results[0].elevation,
  //       ip: myIP,
  //       latitude: latlng[0],
  //       longitude: latlng[1]
  //     })
  // })
  //   .catch((e) => {
  //     console.log(e.response.data.error_message)
  //     // return res.status(400).json({error: e.response.data.error_message})
  // })

  // return res.status(200).json({message: 'elevation-html5'})
  return res.status(200).sendFile(__dirname + '/elevation-html5.html')
})

app.get('/elevation-ip/', (req, res) => {
  var myIP = ''

  if (app.get('env') === 'production') {
      myIP = req.ip
  } else {
      myIP = '8.8.8.8'
  }
  
  const geo = geoip.lookup(myIP)
  // const client = new Client({})
  
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
      return res.status(200).json({
        elevation: r.data.results[0].elevation,
        latitude: 30.2672,
        longitude: -97.7431
      })
  })
    .catch((e) => {
      // console.log(e.response.data.error_message)
      return res.status(400).json({error: e.response.data.error_message})
  })
})

app.get('/places-static', (req, res) => {
  const client = new Client({})

  const places = client.maps.places({
    version: 'v3',
    key: process.env.GOOGLE_MAPS_API_KEY,
  });

  // Get the list of places near the Eiffel Tower
  const request = {
    query: 'eiffel tower',
    location: {
      lat: 48.85341,
      lng: 2.34880,
    },
    radius: 5000,
  };

  places.nearbySearch(request, (err, results) => {
    if (err) {
      console.log(err);
      return;
    }

    // Print the list of places
    for (const place of results) {
      console.log(place.name);
    }
  });

  return res.status(200).json({ title: 'Google Maps Searchs' })
})

server.listen(3000, () => {
  console.log('Server listening on port: 3000.')
})