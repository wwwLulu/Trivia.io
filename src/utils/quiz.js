const fetch = require('node-fetch')

/* 
    {   Room     Quiz
        'JFDS': [{}]
    }
*/
const quizzes = {}

/**
 *@param {String} room
 */
const generateQuiz = async (room) => {
    const req = await fetch(
        'https://opentdb.com/api.php?amount=10&category=31&type=multiple'
    )
    const data = await req.json()
    const quiz = data.results
    quizzes[room] = quiz
    // quizzes[room].timer = 10
}

/**
 *@param {String} room
 */
const getQuestion = (room) => {
    if (!quizzes[room][0]) {
        return
    }
    let question = quizzes[room][0].question
    let answer = quizzes[room][0].correct_answer
    let choices = quizzes[room][0].incorrect_answers
    choices.push(answer)
    quizzes[room].shift()
    return {
        question,
        choices,
        answer,
    }
}

// const startTimer = (room) => {
//     setInterval(() => {
//         quizzes[room].timer--
//         if (quizzes[room].timer == -1) {

//         }
//     },1000)
// }

module.exports = {
    generateQuiz,
    getQuestion,
}
