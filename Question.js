class Question {

  constructor(question) {
    this._question = question;
    this._answers = [];
  }

  addAnswer(answer) {
    this._answers.push(answer);
  }

  setRightAnswer(answer) {
    this._rightAnswer = answer;
  }

  isRightAnswer(answer) {
    return this._rightAnswer === answer;
  }

  getAnswers() {
    return this._answers;
  }

  getQuestion() {
    return this._question;
  }
}