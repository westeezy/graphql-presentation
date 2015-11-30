import mongoose from 'mongoose';

let InterestsSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

let Interests = mongoose.model('Interests', InterestsSchema);

export default Interests;
