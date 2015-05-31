/**
 * Run `node import.js` to import the sample data into the db.
 */

var async = require('async');

// sample data
var kids = require('./kids.json');
var members = require('./members.json');
var admins = require('./admins.json');

module.exports = function(app, cb) {

  async.series([
    function(cb) {
      migrateAdmin(app, cb);
    },
    function(cb) {
      migrateFamily(app, cb);
    }
  ], cb);
};

function activateAutoMigrate (models, datasource, cb) {
  async.each(models, function (model, cb) {
    datasource.automigrate(model, cb);
  }, cb);
}

function migrateFamily(app, cb) {

  var createdMembers,
    createdKids;

  async.series([
    function (cb) {
      activateAutoMigrate(['Member', 'Kid', 'Relative'], app.dataSources.kidiariDevDs, cb);
    },
    function (cb) {
      console.log('migrating members...');
      app.models.Member.create(members, function (err, _createdMembers) {
        if (err) return cb(err);

        console.log('migrating members...ok');
        createdMembers = _createdMembers;
        cb(null);
      });
    },
    function (cb) {
      console.log('migrating kids...');
      app.models.Kid.create(kids, function (err, _createdKids) {
        if (err) return cb(err);

        console.log('migrating kids...ok');
        createdKids = _createdKids;
        cb(null);
      });
    },
    function (cb) {
      // we add kids to createdMembers[0]
      console.log('migrating relatives...');
      createdKids[0].relationType = "mother";
      createdMembers[0].kids.add(createdKids[0], function (err, createdRelative) {
        if (err) return cb(err);

        createdRelative.relationType = "mother";
        createdRelative.save(function (err) {
          if (err) return cb(err);

          console.log('migrating relatives...ok');
          cb(null);
        });
      });
    }
  ], cb);
}



function migrateAdmin(app, cb) {
  var User = app.models.User,
    RoleMapping = app.models.RoleMapping,
    Role = app.models.Role;


  async.series([
    function(cb) {
      activateAutoMigrate(['User', 'Role', 'RoleMapping'], app.dataSources.kidiariDevDs, cb);
    },
    function(cb) {
      console.log('migrating admins...');
      User.create(admins, function(err, admins) {
        if (err) return cb(err);

        Role.create({
          name: 'admin'
        }, function(err, role) {
          if (err) return cb(err);

          // Make Antho an admin
          role.principals.create({
            principalType: RoleMapping.USER,
            principalId: admins[0].id
          }, function(err, principal) {
            if (err) return cb(err);

            console.log('migrating admins...ok');
            cb(null);
          });
        });
      });
    }
  ], cb);
}
