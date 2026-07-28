import React from "react"

function Note({ note, onDelete }) {
    const formattedDate = new Date(note.created_at).toLocaleDateString("en-US")
    return (
        <div data-testid="note-card" className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">{note.title}</p>
            <p className="mt-1 text-sm text-slate-500">{note.content}</p>
            <p className="mt-2 text-xs text-slate-400">{formattedDate}</p>
            <button
                onClick={() => onDelete(note.id)}
                className="mt-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
                Delete
            </button>
        </div>
    )
}

export default Note
