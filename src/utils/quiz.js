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
    const req = await fetch('https://opentdb.com/api.php?amount=10')
    const data = await req.json()
    const quiz = data.results
    quizzes[room] = quiz
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

module.exports = {
    generateQuiz,
    getQuestion,
}
