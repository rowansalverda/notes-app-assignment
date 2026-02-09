document.addEventListener('DOMContentLoaded', () => {
  const notesForm = document.getElementById('note-form');
  const titleInput = document.getElementById('note-title');
  const descriptionInput = document.getElementById('note-description');
  const colorInput = document.getElementById('note-color');
  const userNotesList = document.getElementById('userNotes');

  let editingNoteId = null;

  fetchNotes();

    notesForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim(); 
        const description = descriptionInput.value.trim(); 
        const color = (colorInput?.value || 'pink').trim();

        if (!title || !description) return;

        try {
            if (editingNoteId) {
                await fetch(`/notes/${editingNoteId}`, {
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'same-origin',
                    body: JSON.stringify({ title, description, color }), 
                }); 
                editingNoteId = null; 
            } else {
                await fetch ('/notes', {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    credentials: 'same-origin',
                    body: JSON.stringify({ title, description, color }), 
                });
            }

            // Reset form
            titleInput.value = '';
            descriptionInput.value = '';
            if (colorInput) colorInput.value = 'pink';

            // Refresh list
            await fetchNotes();
            } catch (err) {
            console.error('Error saving note:', err);
            }
        }); 

        async function fetchNotes() {
            try {
                const res = await fetch('/notes', { credentials: 'same-origin' });
                const notes = await res.json();
                renderNotes(Array.isArray(notes) ? notes : []);
            } catch (err) {
                console.error('Error fetching notes:', err);
            }

        function renderNotes(notes) {
            userNotesList.innerHTML = '';

            if (notes.length === 0) {
                userNotesList.innerHTML = `<li style="color:white; text-align:center;">No notes yet — add one!</li>`;
                return;
            }

            for (const note of notes) {
                const li = document.createElement('li');

            // fallback to pink if missing/invalid
                const safeColor = ['yellow','pink','blue','green','purple'].includes(note.color) ? note.color : 'pink';
                li.className = `note note--${safeColor}`;

                li.innerHTML = `
                    <h3>${escapeHtml(note.title)}</h3>
                    <p>${escapeHtml(note.description)}</p>
                    <small>${note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</small>
                    <div class="note-actions" style="margin-top:10px;">
                        <button class="edit-btn" type="button">Edit</button>
                        <button class="delete-btn" type="button">Delete</button>
                    </div>
                `;

                li.querySelector('.edit-btn').addEventListener('click', () => {
                    editingNoteId = note._id;
                    titleInput.value = note.title || '';
                    descriptionInput.value = note.description || '';
                    if (colorInput) colorInput.value = safeColor;
                });

                li.querySelector('.delete-btn').addEventListener('click', async () => {
                try {
                    await fetch(`/notes/${note._id}`, { method: 'DELETE', credentials: 'same-origin' });
                    fetchNotes();
                    } catch (err) {
                    console.error('Error deleting note:', err);
                    }
                });

                userNotesList.appendChild(li);
                }}

                function escapeHtml(str) {
                    return String(str ?? '')
                    .replaceAll('&', '&amp;')
                    .replaceAll('<', '&lt;')
                    .replaceAll('>', '&gt;')
                    .replaceAll('"', '&quot;')
                    .replaceAll("'", '&#039;');
                }
  }
});