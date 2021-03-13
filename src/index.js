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
const { generateQuiz, getQuestion, quizzes } = require('./utils/quiz')

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
        io.to(user.room).emit('updateUsers', {
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

    socket.on('generateQuiz', async () => {
        const user = getUser(socket.id)
        await generateQuiz(user.room)
        socket.broadcast.to(user.room).emit('startQuiz')
    })

    socket.on('startQuiz', () => {
        const user = getUser(socket.id)
        let question = getQuestion(user.room)
        if (question == null) {
            io.to(user.room).emit('endQuiz')
        } else {
            io.to(user.room).emit('showQuestion', question)
        }

        let questionTime = 10
        const tick = setInterval(() => {
            io.to(user.room).emit('updateTime', questionTime)
            questionTime--
            if (questionTime == -1) {
                io.to(user.room).emit('showAnswer')
                setTimeout(() => {
                    io.to(user.room).emit('showLeaderboard')
                    setTimeout(() => {
                        let question = getQuestion(user.room)
                        if (question == null) {
                            io.to(user.room).emit('endQuiz')
                            clearInterval(tick)
                        } else {
                            questionTime = 10
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

    socket.on('countdownTimer', () => {
        const user = getUser(socket.id)
        // let questionTime = 10
        // const tick = setInterval(() => {
        //     io.to(user.room).emit('updateTime', questionTime)
        //     questionTime--
        //     if (questionTime == -1) {
        //         questionTime = 10
        //         clearInterval(tick)
        //         io.to(user.room).emit('showAnswer')
        //         setTimeout(() => {
        //             io.to(user.room).emit('showLeaderboard')
        //             setTimeout(() => {
        //                 let question = getQuestion(user.room)
        //                 if (question == null) {
        //                     io.to(user.room).emit('endQuiz')
        //                 } else {
        //                     io.to(user.room).emit('showQuestion', question)
        //                 }
        //             }, 3000)
        //         }, 3000)
        //     }
        // }, 1000)
    })
})

server.listen(port, () => {
    console.log(`Server is up on port http://localhost:${port}`)
})
