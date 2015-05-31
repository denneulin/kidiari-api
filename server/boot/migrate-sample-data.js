var migrator = require('../sample-data/migrate');

module.exports = function(app, cb) {
  //if (app.dataSources.db.name !== 'Memory') return;

  console.error('Started the migration of sample data.');
  app.importing = true;

  migrator(app, function(err) {
    delete app.importing;
    if (err) {
      console.error('Cannot import sample data - ', err);
    } else {
      console.error('Sample data was imported.');
    }
    app.emit('import done', err);
    cb(err);
  });
};
