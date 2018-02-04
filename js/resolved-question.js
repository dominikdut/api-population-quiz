
class ResolvedQuestion {

  constructor(question, answer) {
    this._question = question;
    this._answer = answer;
  }

  getQuestion() {
    return this._question
  }

  updateAnswer(answer) {
    this._answer = answer
  }

  isCorrectAnswer() {
    return this._question.isRightAnswer(this._answer);
  }
}