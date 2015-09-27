import mongoose from 'mongoose';

var InterestsSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

var Interests = mongoose.model('Interests', InterestsSchema);

export default Interests;
