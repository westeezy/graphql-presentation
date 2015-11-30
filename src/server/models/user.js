import mongoose from 'mongoose';

let UserSchema = new mongoose.Schema({
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

let User = mongoose.model('User', UserSchema);

export default User;
