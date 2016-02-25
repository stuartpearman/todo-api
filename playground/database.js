var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/database.sqlite'
});

var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 140]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

sequelize.sync().then( () => {

  Todo.findById(2).then((todo) => {
    if (todo) {
      console.log(todo.toJSON());
    } else {
      console.log('no data found');
    }
  });

  Todo.create({
    description: 'Pick up your jaw'
  }).then((todo) => {
    return Todo.create({
      description: 'Lego theory'
    })
  }).then(() => {
    // return Todo.findById(1)
    return Todo.findAll({
      where: {
        description: {
          $like: '%lego%'
        }
      }
    });
  }).then((todos) => {
    if (todos) {
      todos.forEach((todo) => {
        console.log(todo.toJSON());
      });
    } else {
      console.log('no todo found');
    }
  }).catch( (e) => {
    console.log(e);
  });
});
