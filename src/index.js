const path = require('path')
const http = require('http')

const express = require('express')
const socketio = require('socket.io')

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require('./utils/users')
const { createRoom, cleanUpRooms } = require('./utils/rooms')
const { generateQuiz, getQuestion } = require('./utils/quiz')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    socket.on('join', ({ username, room = createRoom() }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) return callback(error)

        socket.join(user.room)
        //Update Roomdata when someone joins
        io.to(user.room).emit('usersList', {
            users: getUsersInRoom(user.room),
        })
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        cleanUpRooms()
        if (user) {
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            })
        }
    })

    socket.on('generateQuiz', async (callback) => {
        const user = getUser(socket.id)
        await generateQuiz(user.room)
        socket.broadcast.to(user.room).emit('startQuiz')
        callback()
    })

    socket.on('getQuestion', () => {
        const user = getUser(socket.id)
        let question = getQuestion(user.room)
        if (question == null) {
            io.to(user.room).emit('endQuiz')
        } else {
            io.to(user.room).emit('showQuestion', question)
        }
    })

    socket.on('incrementPoints', () => {
        const user = getUser(socket.id)
        user.points++
        const userList = getUsersInRoom(user.room)
        io.to(user.room).emit('updateScores', userList)
    })
})

server.listen(port, () => {
    console.log(`Server is up on port http://localhost:${port}`)
})
