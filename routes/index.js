const recipeRoutes = require('./recipes');
const usersRoutes = require('./users');

const constructorMethod = (app) => {
  app.use('/', recipeRoutes);
  app.use('/', usersRoutes);

  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;