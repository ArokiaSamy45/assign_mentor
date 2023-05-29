const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  id: Number,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', default: null },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
