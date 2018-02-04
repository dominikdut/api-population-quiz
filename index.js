const QUESTIONS_COUNT = 5;
const ANSWERS_COUNT = 4;
let countries = [];
let questions = [];
let resolvedQuestions = [];

function handleAnswer(question, answer) {
  for (let i = 0; i < resolvedQuestions.length; i++) {
    let resolvedQuestion = resolvedQuestions[i];
    if (resolvedQuestion.getQuestion() === question) {
      resolvedQuestion.updateAnswer(answer);
      return;
    }
  }
  resolvedQuestions.push(new ResolvedQuestion(question, answer));
}

function render(question) {
  let answers = question.getAnswers();

  let quizDiv = $('<div></div>');

  let questionHTML = $('<p class="questionText">' + question.getQuestion() + '</p>');
  let answersHTML = $('<ul class="list-inline"></ul>');
  let questionName = 'q' + Math.random();
  for (let j = 0; j < answers.length; j++) {
    let answer = answers[j];
    let answerHTML = $('<li class="list-inline-item"><input class="radio" type="radio" name="{0}"/><p class="answerText">{1}</p></li>'
      .replace("{0}", questionName)
      .replace("{1}", answer + " people"));
    answersHTML.append(answerHTML);
    answerHTML.click(function (event) {
      handleAnswer(question, answer);
      answerHTML.prop('disabled', true);
    })
  }

  quizDiv.append(questionHTML);
  quizDiv.append(answersHTML);
  $('#quiz').append(quizDiv);
}

function randomCountry() {
  let randomIndex = parseInt(Math.random() * countries.length);
  return countries[randomIndex];
}

function extractTotalPopulation(data) {
  let totalPopulation = 0;
  for (let i = 0; i < data.length; i++) {
    let total = data[i].total;
    totalPopulation = totalPopulation + total;
  }
  return totalPopulation;
}

function randomNumber(max) {
  return parseInt(Math.random() * max);
}

function addAnswersRandomly(answers, question) {
  for (let i = 0; i < ANSWERS_COUNT; i++) {
    let randomIndex = randomNumber(answers.length);
    question.addAnswer(answers[randomIndex]);
    answers.splice(randomIndex, 1);
  }
}

function createAnswers(rightAnswer) {
  let answers = [rightAnswer];
  for (let i = 0; i < QUESTIONS_COUNT - 1; i++) {
    answers.push(createFakeAnswer(rightAnswer));
  }
  return answers;
}

function fillWithAnswers(question, country) {
  return new Promise((resolve, reject) => {
    getTotalPopulation(country)
      .then(population => {
        question.setRightAnswer(population);
        let answers = createAnswers(population);
        addAnswersRandomly(answers, question);
        resolve();
      });
  });
}

function getTotalPopulation(country) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://api.population.io:80/1.0/population/2017/' + country,
      type: 'get',
      crossDomain: true,
      dataType: 'json',
      success: function (data) {
        resolve(extractTotalPopulation(data));
      }
    });
  });
}

function createFakeAnswer(correctTotal) {
  let deltaMultiplier = Math.random() + 0.5;
  return parseInt(Math.floor(correctTotal * deltaMultiplier));
}

function createQuestions() {
  return new Promise((resolve, reject) => {
    let tempQuestions = [];
    let promiseAll = [];
    for (let i = 0; i < QUESTIONS_COUNT; i++) {
      let country = randomCountry();
      let question = new Question("What's the population of " + country + "?");
      let promise = fillWithAnswers(question, country)
        .then(() => {
          tempQuestions.push(question);
        });
      promiseAll.push(promise)
    }

    Promise.all(promiseAll).then(() => {
      resolve(tempQuestions)
    });
  });
}

let loadCountries = function () {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'http://api.population.io:80/1.0/countries',
      type: 'get',
      crossDomain: true,
      dataType: 'json',
      success: function (data) {
        countries = data.countries;
        countries.splice('Least developed countries', 1);
        countries.splice('Less developed regions, excluding least developed countries', 1);
        resolve(countries);
      }
    })
  });
};

function run() {
  console.log('Document ready');
  loadCountries()
    .then(countries => createQuestions()
      .then(result => {
        questions = result;
        for (let i = 0; i < questions.length; i++) {
          render(questions[i]);
        }
      }));
}

$(document).ready(function () {
  run();

  $('#submit-btn').click(onSubmitClicked);
  $('#create-btn').click(onNewGameClicked);
});

function onNewGameClicked() {
  countries = [];
  questions = [];
  resolvedQuestions = [];
  $(this).prop('hidden', true);
  $('#quiz').prop('hidden', false).empty();
  $('#score').prop('hidden', true).empty();
  $('#submit-btn').prop('hidden', false).prop('disabled', false);
  run();
}

function onSubmitClicked() {
  let score = 0;
  for (let i = 0; i < resolvedQuestions.length; i++) {
    let resolvedQuestion = resolvedQuestions[i];
    if (resolvedQuestion.isCorrectAnswer()) {
      score = score + 1;
    }
  }
  $(this).prop('disabled', true);
  $('#score')
    .append('<h2>' + score + '</h2>')
    .prop('hidden', false);
  $('#quiz').prop('hidden', true);
  $('#create-btn').prop('hidden', false);
  $('#submit-btn').prop('hidden', true);
  console.log(score);
  console.log(resolvedQuestions);
}
