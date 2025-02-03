const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');  // Ensure the path is correct

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/yourDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// Register Route
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  // Check if username or password are missing
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Send success response
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Registration Error:', error);

    if (error.code === 11000) {
      // This is a MongoDB duplicate error code (if the username is already taken)
      return res.status(400).send('Username already exists');
    }

    res.status(500).send('Registration failed. Please try again.');
  }
});

// Login Route
// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Send success response
    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).send('Login failed. Please try again.');
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
