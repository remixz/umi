const micro = require('micro');
const http = micro(() => '');
const io = require('socket.io')(http)
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
  })

  socket.on('leave-room', () => {
    const room = findRoom(socket.rooms)
    socket.leave(room)
    socket.broadcast.to(room).emit('user-left')
  })

  socket.on('update-status', (obj) => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('update-status', obj)
  })

  socket.on('play', () => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('play')
  })

  socket.on('pause', () => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('pause')
  })

  socket.on('seek', (time) => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('seek', time)
  })

  socket.on('change', (mediaId) => {
    const room = findRoom(socket.rooms)
    socket.broadcast.to(room).emit('change', mediaId)
  })
})

http.listen(3001, () => {
  console.log('listening on 3001')
})
