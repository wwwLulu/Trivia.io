const { Socket } = require('socket.io')

const users = []

/**
 *@param {Socket.id} id
 *@param {String} username
 *@param {String} room
 */
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required!',
        }
    }
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is in use!',
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

/**
 *@param {Socket.id} id
 */
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

/**
 *@param {Socket.id} id
 */
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

/**
 *@param {String} room
 */
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    users,
}
