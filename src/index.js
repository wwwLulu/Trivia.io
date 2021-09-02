const path = require('path')
const http = require('http')

const express = require('express')
const socketio = require('socket.io')

const {
    clearUserPoints,
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require('./utils/users')
const {
    createRoom,
    cleanUpRooms,
    roomTime,
    roomQuizInSession,
} = require('./utils/rooms')
const { generateQuiz, getQuestion } = require('./utils/quiz')
const { create } = require('domain')

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
        user.points = 0
        io.to(user.room).emit('updateUsers', {
            users: getUsersInRoom(user.room),
        })
        io.to(user.room).emit('join', roomQuizInSession[room])
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('updateUsers', {
                room: user.room,
                users: getUsersInRoom(user.room),
            })
            if (getUsersInRoom(user.room).length == 0) {
                io.to(user.room).emit('endQuiz')
            }
        }
        cleanUpRooms(user.room)
    })

    socket.on('generateQuiz', async () => {
        const user = getUser(socket.id)
        roomTime[user.room] = 10
        roomQuizInSession[user.room] = true
        await generateQuiz(user.room)
        io.to(user.room).emit('startQuiz')
        // const user = getUser(socket.id)
        let question = getQuestion(user.room)
        if (question == null) {
            io.to(user.room).emit('endQuiz')
        } else {
            io.to(user.room).emit('showQuestion', question)
        }
        const tick = setInterval(() => {
            if (!roomQuizInSession[user.room]) {
                clearInterval(tick)
            }
            roomTime[user.room]--
            io.to(user.room).emit('updateTime', roomTime[user.room])
            if (roomTime[user.room] == -1) {
                io.to(user.room).emit('showAnswer')
                setTimeout(() => {
                    io.to(user.room).emit('showLeaderboard')
                    setTimeout(() => {
                        let question = getQuestion(user.room)
                        if (question == null) {
                            roomTime[user.room] = 10
                            roomQuizInSession[user.room] = false
                            clearUserPoints(user.room)
                            io.to(user.room).emit('endQuiz')
                            clearInterval(tick)
                        } else {
                            roomTime[user.room] = 10
                            io.to(user.room).emit('showQuestion', question)
                        }
                    }, 3000)
                }, 3000)
            }
        }, 1000)
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
