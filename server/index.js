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

// setup socket.io
// @TODO - remove io code once enough have updated
const io = require('socket.io')(srv)
io.origins('*:*')
setupIo(io)

// setup routes
app.get('/', (req, res) => res.send({status: 'ok'}))
app.post('/update/:token', (req, res) => {
  const token = req.params.token
  if (token !== process.env.UPDATE_TOKEN) {
    return res.end({status: 'not ok'})
  }
  io.emit('app-update')
  res.send({status: 'ok'})
})
app.get('/opening', opening)
app.use('/mal', mal)

// listen
srv.listen(3001, () => {
  console.log('listening on 3001')
})
