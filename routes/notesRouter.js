const express = require('express');
const router = express.Router();
const { Notes } = require('../models/models');

// FETCH ALL NOTES
router.get('/', async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id }).sort({ createdAt: -1 }); 
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes', error: err.message });
    }
})

// CREATE A NEW NOTE
router.post('/', async (req, res) => {
    try {
        const { title, description, color } = req.body;
        const newNote = new Notes({
            title,
            description,
            color,
            user: req.user.id,
        });
        const result = await newNote.save();
        res.status(201).json({ message: 'You have successfully created a new note!', note: result });
    } catch (err) {
        res.status(500).json({ message: 'Error creating note', error: err.message });
    }
});

// UPDATE A NOTE
router.put('/:id', async (req, res) => {
    try {
        const { title, description, color } = req.body;
        const updatedNote = await Notes.findByIdAndUpdate(
            req.params.id,
            { title, description, color },
            { new: true, runValidators: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(200).json({ message: 'Note updated successfully!', note: updatedNote });
    } catch (err) {
        res.status(500).json({ message: 'Error updating note', error: err.message });
    }
});

// DELETE A NOTE
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Notes.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.status(200).json({ message: 'Note deleted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note', error: err.message });
    }
});

module.exports = router;
