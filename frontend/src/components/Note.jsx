import React from "react"

function Note({ note, onDelete }) {
    const formattedDate = new Date(note.created_at).toLocaleDateString("en-US")
    return (<div classNam="note-container">
        <p className="note.title">{note.title}</p>
        <p className="note.content">{note.content}</p>
        <p className="note-date">{formattedDate}</p>
        <button className="note-delete-button" onClick={() => onDelete(note.id)}>
            Delete
        </button>
    </div>
    );
}