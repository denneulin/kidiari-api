'use strict';


/**
 * REST API Tests : Member
 */
var request = require('supertest');
var app = require('../../server/server.js');
var should = require('should');

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
  var credentials = {username:'parent1', password:'toto'};
  var member = {
    firstname: 'parent1',
    lastname: 'parent1',
    gender: 'F',
    phoneNumber: '98765456789',
    username: credentials.username,
    email: 'parent1@gmail.com'
  };


  //TODO : création avec mauvaises données, ...
  //TODO : confirm email
  //TODO : change pwd
  describe('/api/members', function () {
    describe('Unexpected Usage', function() {
      before(function(done) {
        member.password = credentials.password;
        json('post', '/api/members')
          .send(member)
          .expect(200)
          .end(function (err, res) {
            delete member.password;
            done(err);
          });
      });
      it('should not create a new member with duplicate email on POST /api/members', function (done) {
        json('post', '/api/members')
          .send({
            firstname: 'parent2',
            lastname: 'parent2',
            gender: 'F',
            phoneNumber: '9876A5456789',
            username: 'parent2',
            email: member.email,
            password: 'toto'
          })
          .expect(422)
          .end(done);
      });
      it('should not create a new member with duplicate phoneNumber on POST /api/members', function (done) {
        json('post', '/api/members')
          .send({
            firstname: 'parent2',
            lastname: 'parent2',
            gender: 'F',
            phoneNumber: member.phoneNumber,
            username: 'parent2',
            email: 'parent2@gmail.com',
            password: 'toto'
          })
          .expect(422)
          .end(done);
      });
      it('should not create a new member with duplicate username on POST /api/members', function (done) {
        json('post', '/api/members')
          .send({
            firstname: 'parent2',
            lastname: 'parent2',
            gender: 'F',
            phoneNumber: '987612315456789',
            username: member.username,
            email: 'parent2@gmail.com',
            password: 'toto'
          })
          .expect(422)
          .end(done);
      });

      after(function(done) {
        json('post', '/api/members/login')
          .send(credentials)
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);

            json('delete', '/api/members/' + res.body.userId)
              .set('Authorization', res.body.id)
              .expect(204)
              .end(done);
          });
      });
    });

    describe('Expected Usage', function() {
      it('should create a new member on POST /api/members', function (done) {
        member.password = credentials.password;
        json('post', '/api/members')
          .send(member)
          .expect(200)
          .end(function (err, res) {
            delete member.password;
            if(err) return done(err);
            res.body.should.be.type('object');
            res.body.should.have.property('id');
            res.body.should.have.property('username', 'parent1');
            res.body.should.not.have.property('password');
            done();
          });
      });

      //TODO confirmation du user
      it('should login the member with username/password on POST /api/members/login', function (done) {
        json('post', '/api/members/login')
          .send(credentials)
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);
            res.body.should.be.type('object');
            res.body.should.have.property('id');
            res.body.should.have.property('userId');
            token = res.body;
            memberId = token.userId;
            done();
          });
      });
      it('should allow GET /api/members/{my-id}', function(done) {
        json('get', '/api/members/' + memberId)
          .set('Authorization', token.id)
          .expect(200, function(err, res) {
            if (err) return done(err);
            res.body.should.have.properties(member);
            res.body.should.not.have.property('password');
            done();
          });
      });
      it('should not allow GET /api/members/{my-id} without token', function(done) {
        json('get', '/api/members/' + memberId)
          .expect(401, done);
      });
      it('should not allow GET /api/members/{another-id}', function(done) {
        json('get', '/api/members/' + (memberId + 1000))
          .set('Authorization', token.id)
          .expect(401, done);
      });

      it.skip('should not logout member on POST /api/members/logout without token', function(done) {
        json('post', '/api/members/logout')
          .expect(401, done); // TODO check why error 500 instead of 401
      });
      it('should logout existing member on POST /api/members/logout', function(done) {
          json('post', '/api/members/logout')
            .set('Authorization', token.id)
            //.send({})
            .expect(204, done);
        }
      );
      it('should login the member with email/password on POST /api/members/login', function (done) {
        json('post', '/api/members/login')
          .send({email:'parent1@gmail.com', password:'toto'})
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);
            res.body.should.be.type('object');
            res.body.should.have.property('id');
            res.body.should.have.property('userId');
            token = res.body;
            memberId = token.userId;
            done();
          });
      });
      it('should logout existing member on POST /api/members/logout',
        function(done) {
          json('post', '/api/members/logout')
            .set('Authorization', token.id)
            .expect(204, done);
        }
      );

      after(function(done) {
        json('post', '/api/members/login')
          .send(credentials)
          .expect(200)
          .end(function (err, res) {
            if(err) return done(err);

            json('delete', '/api/members/' + res.body.userId)
              .set('Authorization', res.body.id)
              .expect(204)
              .end(done);
          });
      });
    });
  });
});

