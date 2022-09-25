const trivia = require('./documents/trivia.json');

const getRandomTrivia = function(past_trivia = []) {
  const filtered = trivia.filter(c => !past_trivia.find(pc => pc.id === c.id));
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : {"id":0, "riddle":null, "answer": null};
};

const checkTriviaAnswer = function(currentAnswer, riddleanswer) {
  return currentAnswer === riddleanswer;
};


module.exports = {
  getRandomTrivia,
  checkTriviaAnswer
};