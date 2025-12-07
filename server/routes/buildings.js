const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'sampleBuildings.json');

// GET /api/buildings - Get all campus buildings
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading building data:", error);
    res.status(500).json({ error: 'Failed to fetch building data' });
  }
});

module.exports = router;
