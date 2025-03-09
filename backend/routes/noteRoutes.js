const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Get all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get note by roomId
router.get('/:roomId', async (req, res) => {
  try {
    const note = await Note.findOne({ roomId: req.params.roomId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new note
router.post('/', async (req, res) => {
  const { title, content, roomId, username } = req.body;
  
  try {
    // Check if note with roomId already exists
    const existingNote = await Note.findOne({ roomId });
    if (existingNote) {
      return res.status(400).json({ message: 'Note with this room ID already exists' });
    }
    
    const newNote = new Note({
      title,
      content: content || '',
      roomId,
      createdBy: username,
      lastEditedBy: username
    });
    
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a note
router.patch('/:roomId', async (req, res) => {
  const { content, username } = req.body;
  
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { roomId: req.params.roomId },
      { 
        content, 
        lastEditedBy: username 
      },
      { new: true }
    );
    
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;