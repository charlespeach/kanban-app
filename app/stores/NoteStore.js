import uuid from 'node-uuid';
import alt from '../libs/alt';
import NoteActions from '../actions/NoteActions';
import update from 'react-addons-update';

class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

    this.notes = [];

    this.exportPublicMethods({
      list: this.list.bind(this)
    });
  }
  create(note) {
    const notes = this.notes;

    note.id = uuid.v4();

    this.setState({
      notes: notes.concat(note)
    });
  }
  update({id, task}) {
    const notes = this.notes.map((note) => {
      if(note.id === id) {
        note.task = task;
      }

      return note;
    })

    this.setState({notes}); // {notes} is ES6 property shorthand for {notes: notes}
  }
  delete(id) {
    this.setState({
      notes: this.notes.filter((note) => note.id !== id)
    });
  }
  list(ids) {
    return (ids || []).map(
      (id) => this.notes.filter((note) => note.id === id)
    ).filter((a) => a).map((a) => a[0]);
  }
}

export default alt.createStore(NoteStore, 'NoteStore');