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
  var where = {}

  if (req.query.hasOwnProperty('completed') && req.query.completed === 'true') {
    where.completed = true;
  } else if (req.query.hasOwnProperty('completed') && req.query.completed === 'false') {
    where.completed = false;
  }

  if (req.query.hasOwnProperty('q')) {
    where.description = {
      $like: `%${req.query.q}%`
    }
  }

  db.todo.findAll({
    where: where
  }).then((todos) => {
    if (!!todos) {
      res.json(todos);
    } else {
      res.status(404).send();
    }
  }, (e) => {
    res.status(500).json(e);
  });
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
  db.todo.findById(req.params.id).then((todo) => {
    if (todo) {
      todo.destroy();
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  }, (e) => {
    res.status(500).send();
  });
});

app.put('/todos/:id', (req, res) => {
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(req.params.id).then((todo) => {
    if (todo) {
      return todo.update(attributes).then((todo) => {
        res.json(todo.toJSON());
      }, (e) => {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, (e) => {
    res.status(500).send()
  })
});

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Express listening on port ${PORT}`);
  });
});
