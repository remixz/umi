const http = require('http');
const srv = http.createServer((req, res) => res.end('love arrow shoot!'))
const io = require('socket.io')(srv)
io.origins('*:*')

function findRoom (rooms) {
  return Object.keys(rooms).find((k) => k.startsWith('umi//'))
}

io.on('connection', (socket) => {
  socket.on('join-room', (room) => {
    const currentRoom = findRoom(socket.rooms)
    if (currentRoom) return

    socket.join(room)
    socket.broadcast.to(room).emit('user-joined')
    const ioRoom = io.sockets.adapter.rooms[room]
    if (ioRoom) {
      socket.broadcast.to(room).emit('room-count', ioRoom.length)
      socket.emit('room-count', ioRoom.length)
    }
  })

  socket.on('leave-room', () => {
    const room = findRoom(socket.rooms)
    socket.leave(room)
    socket.broadcast.to(room).emit('user-left')
    const ioRoom = io.sockets.adapter.rooms[room]
    if (ioRoom) {
      socket.broadcast.to(room).emit('room-count', ioRoom.length)
    }
  })

  socket.once('disconnecting', () => {
    const room = findRoom(socket.rooms)
    if (!room) return

    socket.leave(room)
    socket.broadcast.to(room).emit('user-left')
    const ioRoom = io.sockets.adapter.rooms[room]
    if (ioRoom) {
      socket.broadcast.to(room).emit('room-count', ioRoom.length)
    }
  })

  socket.on('update-status', (obj) => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('update-status', obj)
  })

  socket.on('player-event', (obj) => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('player-event', obj)
  })

  socket.on('change', (mediaId) => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('change', mediaId)
  })
})

srv.listen(3001, () => {
  console.log('listening on 3001')
})
