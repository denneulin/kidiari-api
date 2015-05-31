'use strict';


/**
 * REST API Tests
 */
var request = require('supertest');
var app = require('../../server/server.js');
var assert = require('assert');

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

  describe('test1', function() {
    it('2+2 = 2', function() {
      assert.equal(2+2, 4);
    });
  });

  describe('Expected Usage', function() {

    describe('POST /api/parents', function () {
      it('should create a new parent', function (done) {
        json('post', '/api/parents')
          .send({
            firstname: 'parent1',
            lastname: 'parent1',
            phoneNumber: '98765456789',
            username: 'parent1',
            email: 'parent@gmail.com',
            password: 'toto'
          })
          .expect(200)
          .end(function (err, res) {
            assert(typeof res.body === 'object');
            assert(res.body.id, 'must have an id');
            assert(res.body.username === 'parent1');
            //TODO check password absent, id ok etc.

            done();
          });
      });
    });
  });
});

