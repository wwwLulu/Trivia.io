'use strict'
const app = Vue.createApp({
    data() {
        return {
            quizAcitve: false,
            lockedInAnswer: false,
            displayAnswer: false,
            userGuess: '',
            userPoints: 0,
            username: '',
            userList: [],
            room: '',
            question: '',
            answer: '',
            choices: [],
        }
    },
    watch: {
        quizQuestions(questions) {
            if ((questions = 0)) {
                this.quizAcitve = false
            }
        },
    },
    methods: {
        lockInAnswer(e) {
            this.lockedInAnswer = true
            this.userGuess = e.target.innerHTML
            document.querySelectorAll('.choice').forEach((choice) => {
                if (!choice.innerHTML == this.answer) {
                    choice.setAttribute('disabled', 'disabled')
                    choice.addClass('semi-transparent')
                }
            })
            this.showAnswer()
        },
        showAnswer() {
            this.displayAnswer = true
            this.checkAnswer()
        },
        checkAnswer() {
            console.log(this.userGuess, this.answer)
            if (this.userGuess == this.answer) {
                this.userPoints++
                socket.emit('incrementPoints')
            }
        },
        shuffleArray(a) {
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[a[i], a[j]] = [a[j], a[i]]
            }
            return a
        },
        generateQuiz() {
            socket.emit('generateQuiz', () => {
                this.getQuestion()
            })
            this.quizAcitve = true
            this.userPoints = 0
        },
        getQuestion() {
            socket.emit('getQuestion')
            this.lockedInAnswer = false
            this.displayAnswer = false
        },
    },
}).mount('#app')
