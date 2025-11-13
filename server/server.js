const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'CampusConnect API Server' });
});

// API Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/study-groups', require('./routes/studyGroups'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});