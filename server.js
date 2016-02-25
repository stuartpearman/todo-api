var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', (req, res) => {
  var filteredTodos = todos;

  if (req.query.hasOwnProperty('completed') && req.query.completed === 'true') {
    filteredTodos = _.where(todos, {completed: true});
  } else if (req.query.hasOwnProperty('completed') && req.query.completed === 'false') {
    filteredTodos = _.where(todos, {completed: false});
  }

  if (req.query.hasOwnProperty('q')) {
    filteredTodos = _.filter(todos, function(todo){
      return todo.description.toLowerCase().indexOf(req.query.q.toLowerCase()) !== -1;
    })
  }

  res.json(filteredTodos);
})

app.get('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then((item) => {
    if (!!item) {
      res.json(item.toJSON());
    } else {
      res.status(404).send();
    }
  }, (e) => {
    res.status(500).json(e);
  });
});

app.post('/todos', (req, res) => {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then((todo) => {
    res.json(todo.toJSON());
  }, (e) => {
    res.status(400).json(e);
  })
});

app.delete('/todos/:id', (req, res) => {
  var matchedTodo = _.findWhere(todos, {id: parseInt(req.params.id)})

  if (!matchedTodo) {
    return res.status(404).json({"error":"no todo found with that ID"});
  }

  todos = _.without(todos, matchedTodo);
  res.json(todos);
});

app.put('/todos/:id', (req, res) => {
  var matchedTodo = _.findWhere(todos, {id: parseInt(req.params.id)})
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }

  _.extend(matchedTodo, validAttributes);
  res.json(matchedTodo);
});

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Express listening on port ${PORT}`);
  });
});
