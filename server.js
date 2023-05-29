const express = require('express');
const mongoose = require('mongoose');
const Mentor = require('./mentor');
const Student = require('./student');
require('dotenv').config();


const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// API endpoints -------------------------------------------------------------------------------------------------------------------------

// Create a mentor
app.post('/mentors', async (req, res) => {
  try {
    const { name } = req.body;

    // Check if a mentor with the same name already exists
    const existingMentor = await Mentor.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });

    if (existingMentor) {
      return res.status(400).json({ message: 'Mentor already exists' });
    }

    const mentor = await Mentor.create(req.body);
    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mentor' });
  }
});



// Create a student -------------------------------------------------------------------------------------------------------------------------
app.post('/students', async (req, res) => {
  try {
    const { name } = req.body;

    // Check if a student with the same name already exists
    const existingStudent = await Student.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });


    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// GET /students -------------------------------------------------------------------------------------------------------------------------
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find().select('-__v');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /mentors -------------------------------------------------------------------------------------------------------------------------
app.get('/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find().select('-__v');
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Assigning multiple students to a mentor -------------------------------------------------------------------------------------------------------------------------
app.put('/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { studentIds } = req.body;

    // Find the mentor by mentorId
    const mentor = await Mentor.findOne({ id: mentorId });

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Update the students' mentor field with the mentor's ID
    await Student.updateMany(
      { id: { $in: studentIds } },
      { mentor: mentor._id }
    );


    res.status(200).json({ message: 'Students assigned to mentor successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign students to mentor' });
  }
});


// Previously assigned mentor for a particular student. --------------------------------------------------------------------------------------------------------
app.get('/students/:studentId/mentor', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student by studentId
    const student = await Student.findOne({ id: studentId }).populate('mentor');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the student has a mentor assigned
    if (!student.mentor) {
      return res.status(404).json({ message: 'No mentor assigned for this student' });
    }

    res.status(200).json({ mentor: student.mentor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student mentor' });
  }
});



// Other API endpoints... -------------------------------------------------------------------------------------------------------------------------

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
