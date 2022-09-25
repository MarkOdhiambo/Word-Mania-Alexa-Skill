const riddles = require('./documents/riddle.json');

const getRandomRiddle = function(past_riddles = []) {
  const filtered = riddles.filter(c => !past_riddles.find(pc => pc.id === c.id));
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : {"id":0, "riddle":null, "answer": null};
};

const checkRiddleAnswer = function(currentAnswer, riddleanswer) {
  return currentAnswer === riddleanswer;
};


module.exports = {
  getRandomRiddle,
  checkRiddleAnswer
};