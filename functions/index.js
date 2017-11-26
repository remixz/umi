const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.cleanRooms = functions.database.ref('roomUsers/{roomId}')
  .onDelete((event) => {
    const root = event.data.adminRef.root
    return Promise.all([
      root.child(`rooms/${event.params.roomId}`).remove(),
      root.child(`roomEmoji/${event.params.roomId}`).remove()
    ])
  })
