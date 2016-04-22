//dependencies
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//config
app.use(express.static('client'));
app.use(bodyParser.json());

//models/db
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/questions_db');

var UserSchema = new Schema({
  name: String,
  questions: [{type:Schema.ObjectId, ref:'Question'}],
  answers: [{type:Schema.ObjectId, ref:'Answer'}]
})
mongoose.model("User", UserSchema);

var QuestionSchema = new Schema({
  _author: {type:Schema.ObjectId, ref:'User'},
  title: {type: String, minlength: 10, required: true},
  description: String
})
mongoose.model("Question", QuestionSchema);

var AnswerSchema = new Schema({
  _author: {type:Schema.ObjectId, ref:'User'},
  _question: {type:Schema.ObjectId, ref:'Question'},
  answer: {type: String, minlength: 5, required: true},
  description: String
})
mongoose.model("Answer", AnswerSchema);




var User = mongoose.model('User');
var Question = mongoose.model('Question');
var Answer = mongoose.model('Answer');

//routes
app.post('/login', function(req, res){
  User.findOne({name: req.body.name}, function(err, user){
    if(err){ 
      console.log(err);
    }
    else{
      if(user){
        res.json(user);
      } 
      else{
        User.create({name: req.body.name}, function(err, newUser){
          if(err) { console.log(err); }
          res.json(newUser);
        })
      }
    }
  })
})
app.post('/new_question', function(req, res){
  var question = {
    _author: req.body.userId,
    title: req.body.title,
    description: req.body.description

  }
  Question.create(question, function(err, newQuest){
    User.findOneAndUpdate({_id:req.body.userId}, {$push:{"questions":newQuest._id}}).exec(function(err, user){
      res.json(newQuest);
    })
  })
})
app.post('/answer', function(req,res){
    var answer = {
    _author: req.body.userId,
    answer: req.body.answer,
    _question: req.body.questionId
  }
  Answer.create(answer,function (err, newAnswer){
    Question.findOneAndUpdate({_id:answer._question}, {$push:{"questions":newAnswer._id}}).exec(function(err, post){
      User.findOneAndUpdate({_id:answer._author}, {$push:{"questions":newAnswer._id}}).exec(function(err,user){
        res.json(200);
      })
    })
  })
})
app.get('/questions', function(req,res){
  Question.find({}, function(err, questions){
    if(err){
      console.log(err);
    } else{
      res.json(questions);
    }
  })
})

app.get('/question/:id', function(req, res){
  Question.findOne({_id: req.params.id}, function(err, questions){
    if(err){
      console.log(err);
    } else{
      res.json(questions);
    }
  })
})

app.get('/question/:id/new_answer', function(req, res){
  Question.findOne({_id: req.params.id}, function(err, questions){
    if(err){
      console.log(err);
    } else{
      res.json(questions);
    }
  })
})


//listen
app.listen(8000, function(){
  console.log("listening on port 8000");
})