'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

const knex = require('../knex');
const hydrateNotes = require('../utils/hydrateNotes');
// const getJoinedNoteById = require('../utils/dbUtils');

const getJoinedNoteById = function(id) {
  return knex.select(
    'notes.id', 'title','content',
    'folders.id as folder_id', 'folders.name as folderName',
    'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .where('notes.id', id);
};

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm, folderId, tagId} = req.query;

  knex
    // .select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folderName')
    .select(
      'notes.id',
      'title',
      'notes.content',
      'folders.id as folderId',
      'folders.name as folderName',
      'tags.id as tagId',
      'tags.name as tagName'
    )
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(queryBuilder => {
      if(folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(queryBuilder => {
      if(tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .limit(10)
    .then(results => {
      if(results) {
        const hydrated = hydrateNotes(results);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select(
      'notes.id',
      'title',
      'content',
      'folders.id as folderId',
      'tags.id as tagId',
      'tags.name as tagName'
    )
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
    .where('notes.id', id)
    .then(result => {
      if(result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated[0]);
      } else {
        next();
      }
    })
    .catch(err => {
      err.status = 404;
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const {title, content, folderId, tags} = req.body;

  if(!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null
  };

  knex('notes')
    .update(updateItem)
    .where('id', noteId)
    .returning(['id'])
    .then(() => {
      return knex.del().from('notes_tags').where({note_id: noteId})
    })
    .then(() => {
      const newTags = tags.map(tagId => ({note_id: noteId, tag_id: tagId}));
      return knex.insert(newTags).into('notes_tags');
    })
    .then(() => {
      return getJoinedNoteById(noteId);
    })
    .then((result) => {
      if(result) {
        const hydrated = hydrateNotes(result)[0];
        res.json(hydrated);
      } else {
        next();
      }
    });
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId} = req.body;
  const tags = req.body.tags ? req.body.tags : [];

  const newItem = {
    title,
    content,
    folder_id :folderId ? folderId : null
  };

  let noteId;

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex.insert(newItem).into('notes').returning('id')
    .then(([id]) => {
      noteId = id;

      const newTags = tags.map(tagId => ({note_id: noteId, tag_id: tagId}));
      return knex.insert(newTags).into('notes_tags');
    })
    .then(() => {
      return getJoinedNoteById(noteId);
    })
    .then(result => {
      if(result) {
        const hydrated = hydrateNotes(result)[0];
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('id', id)
    .del()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
