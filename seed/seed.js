import mongoose from 'mongoose';
import User from '../src/server/models/user';
import Interests from '../src/server/models/interests';

// connect to mongo

mongoose.connect('mongodb://localhost/graphql');

// seed users

var users = [

  {
  _id: '559645cd1a38532d14349240',
  name: 'Han Solo',
  friends: [],
  interests: ['56081ed7b1b98955710599e8']
},

{
  _id: '559645cd1a38532d14349241',
  name: 'Chewbacca',
  friends: ['559645cd1a38532d14349240'],
  interests: ['56081ed7b1b98955710599e8']
},

{
  _id: '559645cd1a38532d14349242',
  name: 'R2D2',
  friends: ['559645cd1a38532d14349246'],
  interests: ['56081ed7b1b98955710599e6', '56081ed7b1b98955710599e7']
},

{
  _id: '559645cd1a38532d14349246',
  name: 'Luke Skywalker',
  friends: ['559645cd1a38532d14349240', '559645cd1a38532d14349242'],
  interests: ['56081ed7b1b98955710599e6', '56081ed7b1b98955710599e7']
}
];

var interests = [
  {
  _id: '56081ed7b1b98955710599e6',
  name: 'Sci Fi'
},
{
  _id: '56081ed7b1b98955710599e7',
  name: 'graphql'
},
{
  _id: '56081ed7b1b98955710599e8',
  name: 'stuff'
}
];


//TODO: Replace with co
function createInterests(cb) {
  Interests.create(interests, (err, res) => {
    if(err) {
      console.log(err);
    } else {
      console.log('Interests created.');
      cb ? cb() : process.exit();
    }
  });
}

function createUsers(cb) {
  User.create(users, (err, res) => {
    if(err) {
      console.log(err);
    } else {
      console.log('Users created.');
      cb ? cb() : process.exit();
    }
  });
}

// drop collections
mongoose.connection.collections['users'].drop( (err) => {
  mongoose.connection.collections['interests'].drop( (err) => {
    createUsers(createInterests);
  });
});
