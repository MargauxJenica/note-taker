const notes = require('express').Router();
const { readAndAppend, readFromFile, writeToFile } = require('../helpers/fsUtils.js');
const { v4: uuidv4 } = require('uuid');

// GET Route for retrieving all notes
notes.get('/', (req, res) =>
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
);

// POST Route for submitting note
notes.post('/', (req, res) => {
    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;
  
    if (title && text) {
      // Check if title and text are present in req.body
  
      // Variable for the object we will save
      const newNote = {
        title,
        text,
        id: uuidv4(),
      };
  
      readAndAppend(newNote, './db/db.json')
        .then((data) => {
            console.log('Data from readFromFile:', data);
            const response = {
                status: 'success',
                body: newNote,
            };
            res.json(response);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    } else {
      res.status(400).json({ error: 'Title and text are required in the request body' });
    }
  });
  
// DELETE Route for a specific note 
notes.delete('/:id', (req, res) => {
    const noteId = req.params.id;

    readFromFile('./db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            // Find the index of the note with the specified ID
            const index = json.findIndex((note) => note.id === noteId);

            // Check if the note with the specified ID exists
            if (index !== -1) {
                // Remove the note from the array
                json.splice(index, 1);

                // Save the updated array to the filesystem
                writeToFile('./db/db.json', json);

                res.json(`${noteId} has been deleted`);
            } else {
                // Note with the specified ID not found
                res.status(404).json({ error: `Note with ID ${noteId} not found` });
            }
        })
        .catch((err) => {
            // Handle errors, such as file reading error
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

module.exports = notes;
