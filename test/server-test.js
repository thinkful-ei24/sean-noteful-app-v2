'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');

// utils
// TODO try to get this working?
// const getJoinedNoteById = require('../utils/dbUtils');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Sanity check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});


describe('Static Server', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

  describe('Noteful API', function () {
    const seedData = require('../db/seedData');
  
    beforeEach(function () {
      return seedData('./db/noteful.sql');
    });
  
    after(function () {
      return knex.destroy(); // destroy the connection
    });
  
    describe('GET /api/notes', function () {
  
      it('should return the default of 10 Notes ', function () {
        return chai.request(app)
          .get('/api/notes')
          .then(function (res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length(10);
          });
      });
  
      it('should return correct search results for a valid searchTerm', function () {
        return chai.request(app)
          .get('/api/notes?searchTerm=about%20cats')
          .then(function (res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.length(4);
            expect(res.body[0]).to.be.an('object');
          });
      });
  
    });

    // MY TESTS
    describe('404 handler', function () {

      // TODO check across several request types
      it('should respond with 404 when given a bad path', function () {
        return chai.request(app)
          .get('/api/notes/invalid/path')
          .then(function(res) {
            expect(res).to.have.status(404);
          });
      });
  
    });
  
    describe('GET /api/notes', function () {
  
      it('should return an array of objects where each item contains id, title, and content', function () {
        return chai.request(app)
          .get('/api/notes')
          .then(function (res) {
            expect(res).to.exist;
            expect(res).to.have.status(200);

            expect(res.body).to.be.an('array');
            res.body.forEach(resObj => {
              expect(resObj).has.property('id');
              expect(resObj).has.property('title');
              expect(resObj).has.property('content');
            });
          });
      });
  
      it('should return an empty array for an incorrect searchTerm', function () {
        return chai.request(app)
          .get('/api/notes?searchTerm=about%20dogs%20and%20other%20things%20that%20would%20fail%20this%20test')
          .then(res => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
          });
      });
  
    });
  
    describe('GET /api/notes/:id', function () {
  
      it('should return correct note when given an id', function () {
        // let httpRes;
        // return chai.request(app)
        //   .get('/api/notes/1')
        //   .then(res => {
        //     httpRes = res;
        //     expect(res).to.have.status(200);
        //     expect(res.body).to.be.an('object');

        //     return getJoinedNoteById(1);
        //   })
        //   .then(([dbItem]) => {
        //     expect(httpRes.body).to.deep.equal(dbItem);
        //   });
        return chai.request(app)
          .get('/api/notes/1')
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');

            // const compareObj = {
            //   title: '5 life lessons learned from cats',
            //   content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
            //   folder_id: 100
            // };
            expect(res.body).to.have.property('title', '5 life lessons learned from cats');
            expect(res.body).to.have.property('content', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...');
            expect(res.body).to.have.property('folderId', 100);
          });
      });
  
      it.only('should respond with a 404 for an invalid id', function () {
        return chai.request(app)
          .get('/api/notes/44651356541656551')
          .then(res => {
            expect(res).to.have.status(404);
          });
      });
  
    });
  
    describe('POST /api/notes', function () {
  
      it('should create and return a new item when provided valid data', function () {
        const data = {
          "title": "dummy note title",
          "content": "dummy note contents"
        };

        chai.request(app).post('/api/notes')
          .send(data)
          .then(res => {
            expect(res).to.have.status(201);
          });

      });
  
      it('should return an error when missing "title" field', function () {
        return false;
      });
  
    });
  
    describe('PUT /api/notes/:id', function () {
  
      it('should update the note', function () {
        return false;
      });
  
      it('should respond with a 404 for an invalid id', function () {
        return false;
      });
  
      it('should return an error when missing "title" field', function () {
        return false;
      });
  
    });
  
    describe('DELETE  /api/notes/:id', function () {
  
      it('should delete an item by id', function () {
        return false;
      });
  
    });

  });
});