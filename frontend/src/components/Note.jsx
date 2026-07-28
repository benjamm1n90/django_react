import React from "react"

function Note({ note, onDelete }) {
    const formattedDate = new Date(note.created_at).toLocaleDateString("en-US")
    return (
        <div data-testid="note-card" className="rounded-lg border border-purple-500/30 bg-black/40 p-3 backdrop-blur-sm">
            <p className="font-semibold text-cyan-300">{note.title}</p>
            <p className="mt-1 text-sm text-slate-300">{note.content}</p>
            <p className="mt-2 text-xs text-slate-500">{formattedDate}</p>
            <button
                onClick={() => onDelete(note.id)}
                className="mt-2 rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            >
                Delete
            </button>
        </div>
    )
}

export default Note
