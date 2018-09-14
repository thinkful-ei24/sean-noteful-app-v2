
// const knex = require('knex');

// const getJoinedNoteById = function(id) {
//   return knex.select(
//     'notes.id', 'title','content',
//     'folders.id as folder_id', 'folders.name as folderName',
//     'tags.id as tagId', 'tags.name as tagName')
//     .from('notes')
//     .leftJoin('folders', 'notes.folder_id', 'folders.id')
//     .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
//     .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
//     .where('notes.id', id);
// };

// module.exports = getJoinedNoteById;