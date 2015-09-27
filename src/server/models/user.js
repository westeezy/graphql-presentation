import mongoose from 'mongoose';

var UserSchema = new mongoose.Schema({
  name: {
    type: String
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interests'
  }]
});

var User = mongoose.model('User', UserSchema);

export default User;
