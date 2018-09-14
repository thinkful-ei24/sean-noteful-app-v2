
function hydrateNotes(input) {
  const hydrated = [], lookup = {};
  for (let note of input) {
    if (!lookup[note.id]) {
      lookup[note.id] = note;
      console.log(note);
      lookup[note.id].tags = [];
      hydrated.push(lookup[note.id]);
    }

    if (note.tagId && note.tagName) {
      lookup[note.id].tags.push({
        id: note.tagId,
        name: note.tagName
      });
    }
    delete lookup[note.id].tagId;
    delete lookup[note.id].tagName;
  }
  return hydrated;
}

// input is an array of flattened entries. duplicate entry ids are expected
function hydrate(input) {
  const hydrated = [], lookup = {};
  for(let entry of input) {
    if(!lookup[entry.id]) {
      lookup[entry.id] = entry;

    }
  }
}

module.exports = hydrateNotes;