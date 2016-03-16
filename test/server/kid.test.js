'use strict';


/**
 * REST API Tests : Kid
 */
var request = require('supertest');
var app = require('../../server/server.js');
var should = require('should');
var async = require('async');

before(function importSampleData(done) {
  this.timeout(50000);
  if (app.importing) {
    app.on('import done', done);
  } else {
    done();
  }
});


function json(verb, url) {
  return request(app)[verb](url)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/);
}

describe('REST', function() {

  var token;
  var memberId;
  var kidId;
  var relativeId;
  var credentials = {username:'parent1', password:'toto'};
  var member = {
    firstname: 'parent1',
    lastname: 'parent1',
    gender: 'F',
    phoneNumber: '98765456789',
    username: credentials.username,
    email: 'parent1@gmail.com'
  };

  var kid = {
    firstname: 'enfant1'
  };


  describe('/api/kids', function () {

    before(function(done) {
      member.password = credentials.password;
      json('post', '/api/members')
        .send(member)
        .expect(200)
        .end(function (err, res) {
          delete member.password;
          if(err) return done(err);

          json('post', '/api/members/login')
            .send(credentials)
            .expect(200)
            .end(function (err, res) {
              if(err) return done(err);
              token = res.body;
              memberId = token.userId;
              done();
            });
        });
    });

    describe('Expected Usage', function() {
      it('should create a new kid on POST /api/members/{id}/kids', function (done) {
        json('post', '/api/members/' + memberId + '/kids')
          .set('Authorization', token.id)
          .send(kid)
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);

            res.body.should.be.type('object');
            res.body.should.have.property('id');
            res.body.should.have.property('firstname', kid.firstname);
            kidId = res.body.id;
            done();
          });
      });

      it('should define the relation type as parent on PUT /api/relatives/{id}', function(done) {
        json('get', '/api/relatives/findOne?filter={"where":{"memberId":"' + memberId + '","kidId":"' + kidId + '"}}')
          .set('Authorization', token.id)
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);

            res.body.should.be.type('object');
            res.body.should.have.property('id');
            res.body.should.have.property('memberId', memberId);
            res.body.should.have.property('kidId', kidId);

            relativeId = res.body.id;
            json('put', '/api/relatives/' + relativeId)
              .set('Authorization', token.id)
              .send({relationType:'parent'})
              .expect(200)
              .end(function (err, res) {
                if(err) return done(err);
                res.body.should.be.type('object');
                res.body.should.have.property('id');
                res.body.should.have.property('memberId', memberId);
                res.body.should.have.property('kidId', kidId);
                res.body.should.have.property('relationType', 'parent');

                done();
              });
          });
      });
    });

    describe('Unexpected Usage', function() {
      it('should not create a kid on POST /api/kids', function (done) {
        json('post', '/api/kids')
          .set('Authorization', token.id)
          .send(kid)
          .expect(404)
          .end(done);
      });
    });

    after(function(done) {
      async.series([
        function(cb) {
          json('delete', '/api/members/' + memberId)
            .set('Authorization', token.id)
            .expect(200)
            .end(cb);
        },
        function(cb) {
          json('delete', '/api/kids/' + kidId)
            .set('Authorization', token.id)
            .expect(200)
            .end(cb);
        },
        function(cb) {
          json('delete', '/api/relatives/' + relativeId)
            .set('Authorization', token.id)
            .expect(200)
            .end(cb);
        }
      ], done);
    });
  });
});

