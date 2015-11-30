'use strict';

import {
  expect
}
from 'chai';
import request from 'co-supertest';
import mongoose from 'mongoose';
import server from './server';

let User = mongoose.model('User');
let Interests = mongoose.model('Interests');

describe('graphql', function() {
  describe('query', function() {
    it('should return with user by id for shorthand query', function*() {
      let user = new User({
        name: 'John Doe'
      });

      let findByIdStub = this.sandbox.stub(User, 'findById').returnsWithResolve(
        user);

        let resp = yield request(server.listen())
        .get('/data')
        .query({
          query: `
          {
            user(id: "${user._id}") {
              name
            }
          }
          `,
          params: {
            userId: user._id.toString()
          }
        })
        .expect(200)
        .end();
        expect(findByIdStub).to.calledWithMatch(user._id.toString(), {
          name: true
        });

        expect(resp.body).to.be.eql({
          data: {
            user: {
              name: 'John Doe'
            }
          }
        });
    });

    it('should return the interests with name', function*() {
      let interest = [new Interests({
        name: 'Interest1'
      })];

      let findStub = this.sandbox.stub(Interests, 'find').returnsWithResolve(interest);

      let resp = yield request(server.listen())
      .get('/data')
      .query({
        query: `
        {
          interests {
            name
          }
        }
        `
      })
      .expect(200)
      .end();

      expect(findStub).calledWith();

      expect(resp.body).to.be.eql({
        data: {
          interests: [{
            name: 'Interest1'
          }]
        }
      });
    });

    it('should return with user by id with friends for query with params', function*() {
      let friend1 = new User({
        name: 'Friend One'
      });

      let friend2 = new User({
        name: 'Friend Two'
      });

      let user = new User({
        name: 'John Doe',
        friends: [friend1, friend2]
      });

      let findStub = this.sandbox.stub(User, 'find').returnsWithResolve(
        [friend1, friend2]);

        this.sandbox.stub(User, 'findById').returnsWithResolve(user);

        let resp = yield request(server.listen())
        .get('/data')
        .query({
          query: `
          query getUser($userId: String!) {
            user(id: $userId) {
              name
              friends {
                name
              }
            }
          }
          `,
          params: {
            userId: user._id.toString()
          }
        })
        .expect(200)
        .end();

        expect(findStub).to.calledWithMatch({
          _id: {
            $in: [ `{ friends: [],\n  interests: [],\n  _id: ${friend1._id.toString()},\n  name: \'Friend One\' }`,
              `{ friends: [],\n  interests: [],\n  _id: ${friend2._id.toString()},\n  name: \'Friend Two\' }` ]
          }
        }, {
          name: true
        });

        expect(resp.body).to.be.eql({
          data: {
            user: {
              name: 'John Doe',
              friends: [{
                name: 'Friend One'
              }, {
                name: 'Friend Two'
              }]
            }
          }
        });
    });

    it('should handle bad queries', function*() {
      yield request(server.listen())
      .get('/data')
      .query({
        query: `
        query {
          user {
            name
          }
        }
        `
      })
      .expect(400)
      .end();
    });
  });

  describe('mutation', function() {
    it('should set user name', function*() {
      let user = new User({
        name: 'Smith Doe'
      });

      let findAndUpdateStub = this.sandbox.stub(User, 'update', function() {
        user.name = 'John Smith';
        return Promise.resolve(user);
      });

      this.sandbox.stub(User, 'findById').returnsWithResolve(user);

      let resp = yield request(server.listen())
      .post('/data')
      .send({
        query: `
        mutation updateUser($userId: String! $name: String!) {
          updateUser(id: $userId name: $name) {
            name
          }
        }
        `,
        params: {
          userId: user._id,
          name: 'John Smith'
        }
      })
      .expect(200)
      .end();

      expect(findAndUpdateStub).to.calledWithMatch({
        _id: user._id.toString()
      }, {
        $set: {
          name: 'John Smith'
        }
      });

      expect(resp.body).to.be.eql({
        data: {
          updateUser: {
            name: 'John Smith'
          }
        }
      });
    });
  });
});
