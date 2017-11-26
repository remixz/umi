const express = require('express')
const compression = require('compression')
const cors = require('cors')

const setupIo = require('./io')
const opening = require('./routes/opening')
const mal = require('./routes/mal')

// create app
const app = express()
const srv = require('http').Server(app)
app.use(compression())
app.use(cors())

// setup routes
app.get('/', (req, res) => res.send({status: 'ok'}))
app.get('/opening', opening)
app.use('/mal', mal)

// setup socket.io
// @TODO - remove io code once enough have transitioned over
const io = require('socket.io')(srv)
io.origins('*:*')
setupIo(io)

// setup firebase app update handler
if (process.env.NODE_ENV === 'production') {
  const firebase = require('firebase')
  const config = {
    apiKey: 'AIzaSyCUktVh5mjlAyr-_1uksCLpuESY5vF-jwg',
    authDomain: 'umi-player.firebaseapp.com',
    databaseURL: 'https://umi-player.firebaseio.com',
    projectId: 'umi-player',
    storageBucket: 'umi-player.appspot.com',
    messagingSenderId: '688413516796'
  }
  firebase.initializeApp(config)
  firebase.auth().signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_PASSWORD)

  app.post('/update/:token', (req, res) => {
    const token = req.params.token
    if (token !== process.env.UPDATE_TOKEN) {
      return res.end({status: 'not ok'})
    }
    firebase.database().ref('appUpdate').set(Date.now())
    io.emit('app-update')
    res.send({status: 'ok'})
  })
}

// listen
srv.listen(3001, () => {
  console.log('listening on 3001')
})
