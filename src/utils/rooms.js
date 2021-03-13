const { users } = require('./users')
const roomTime = {}
const rooms = new Set()

const createRoom = () => {
    //generate random 4 Letter Code
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
    const code = []

    while (!rooms.has(code.join(''))) {
        for (let i = 0; i < 4; i++) {
            code[i] = alphabet[Math.floor(Math.random() * 26)]
        }
        if (!rooms.has(code.join(''))) {
            rooms.add(code.join(''))
        }
    }
    return code.join('')
}

/**
 * Deletes the room from rooms list if no one is in it.
 * Called when a user leaves room to check if its empty
 * @param {String} room
 */
const cleanUpRooms = (room) => {
    let roomSessions = users.filter((user) => user.room === room)
    if (roomSessions.length == 0) {
        rooms.delete(room)
    }
}

module.exports = {
    createRoom,
    cleanUpRooms,
    roomTime,
}
