const express = require('express');
const router = express.Router();

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    // TODO: Implement Firebase query
    res.json({ message: 'Events endpoint working', events: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res) => {
  try {
    // TODO: Implement event creation
    res.json({ message: 'Event created', event: req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const eventRef = db.collection('events').doc(id);
    const doc = await eventRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Enforce permissions
    const userId = req.user.uid; // if using auth middleware
    if (doc.data().createdBy !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }

    await eventRef.delete();

    return res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Failed to delete event.', error });
  }

  //     const userId = req.user.uid; // if using auth middleware
  //   if (doc.data().createdBy !== userId) {
  //     return res.status(403).json({ message: 'Not authorized to delete this event.' });
  //   }

  //   await eventRef.delete();

  //   return res.status(200).json({ message: 'Event deleted successfully.' });
  // } catch (error) {
  //   console.error('Delete event error:', error);
  //   return res.status(500).json({ message: 'Failed to delete event.', error });
  // }
});



module.exports = router;