import { useState, useEffect } from "react"
import api from "../api"
import Note from "../components/Note"

// Shared input styling, reused across the create form, the inline edit
// fields, and the note-creation form. Pulling repeated utility strings
// into a plain constant like this is the idiomatic way to avoid
// duplication with Tailwind in React - no need for @apply or a component
// library for something this small.
const inputClass =
    "w-full rounded-lg border border-cyan-500/30 bg-black/40 px-3 py-2.5 text-[0.95rem] text-cyan-100 placeholder:text-slate-500 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-[3px] focus:ring-cyan-400/30"

function Estimate() {

    const [estimates, setEstimates] = useState([])
    const [customerName, setCustomerName] = useState("")
    const [squareFootage, setSquareFootage] = useState("")
    const [poundEstimate, setPoundEstimate] = useState("")
    const [crewSize, setCrewSize] = useState("")
    const [editingId, setEditingId] = useState(null)

    const [editForm, setEditForm] = useState({
        customer_name: "",
        square_footage: "",
        pound_estimate: "",
        crew_size: ""
    })

    // Which estimates currently have their notes panel expanded, and the
    // in-progress "new note" draft for each one.
    const [openNotesIds, setOpenNotesIds] = useState(new Set())
    const [noteDrafts, setNoteDrafts] = useState({})

    useEffect(() => {
        getEstimates()
    }, [])

    const getEstimates = () => {
        api
            .get("/api/estimates/")
            .then((res) => res.data)
            .then((data) => setEstimates(data))
            .catch((err) => alert(err))
    }

    const createEstimate = (e) => {
        e.preventDefault()
        api
            .post("/api/estimates/", {
                customer_name: customerName,
                square_footage: squareFootage,
                pound_estimate: poundEstimate,
                crew_size: crewSize
            })
            .then((res) => {
                setEstimates((prev) => [res.data, ...prev])
                setCustomerName("")
                setSquareFootage("")
                setPoundEstimate("")
                setCrewSize("")
            })
            .catch((err) => alert(err))
    }

    const startEdit = (est) => {
        setEditingId(est.id)
        setEditForm({
            customer_name: est.customer_name,
            square_footage: est.square_footage,
            pound_estimate: est.pound_estimate,
            crew_size: est.crew_size
        })
    }

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        })
    }

    const updateEstimate = (id) => {
        api
            .patch(`/api/estimates/update/${id}/`, editForm)
            .then((res) => {
                setEstimates((prev) =>
                    prev.map((est) =>
                        est.id === id ? res.data : est
                    )
                )
                setEditingId(null)
            })
            .catch((err) => alert(err))
    }

    const deleteEstimate = (id) => {
        api
            .delete(`/api/estimates/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    // remove from UI immediately (better UX)
                    setEstimates((prev) => prev.filter((est) => est.id !== id))
                } else {
                    alert("Failed to delete estimate")
                }
            })
            .catch((error) => alert(error))
    }

    const toggleNotes = (estimateId) => {
        setOpenNotesIds((prev) => {
            const next = new Set(prev)
            if (next.has(estimateId)) {
                next.delete(estimateId)
            } else {
                next.add(estimateId)
            }
            return next
        })
    }

    const updateNoteDraft = (estimateId, field, value) => {
        setNoteDrafts((prev) => ({
            ...prev,
            [estimateId]: {
                ...(prev[estimateId] || { title: "", content: "" }),
                [field]: value,
            },
        }))
    }

    const createNote = (estimateId, e) => {
        e.preventDefault()
        const draft = noteDrafts[estimateId] || { title: "", content: "" }
        api
            .post(`/api/estimates/${estimateId}/notes/`, draft)
            .then(() => {
                setNoteDrafts((prev) => ({ ...prev, [estimateId]: { title: "", content: "" } }))
                getEstimates()
            })
            .catch((err) => alert(err))
    }

    const deleteNote = (noteId) => {
        api
            .delete(`/api/notes/delete/${noteId}/`)
            .then(() => getEstimates())
            .catch((err) => alert(err))
    }

    return (
        <div className="mx-auto my-12 max-w-[860px] p-8 text-slate-200">

            {/* === Create Estimate Form === */}
            <h2 className="mb-5 text-2xl font-semibold uppercase tracking-widest text-cyan-300">Create a New Estimate</h2>
            <form
                onSubmit={createEstimate}
                className="mb-10 grid grid-cols-2 items-start gap-x-5 gap-y-1 rounded-2xl border border-cyan-500/30 bg-black/50 p-7 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md"
            >
                <label className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Customer Name</label>
                <input
                    type="text"
                    className={inputClass}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                />

                <label className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Square Footage</label>
                <input
                    type="number"
                    className={inputClass}
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(e.target.value)}
                    required
                />

                <label className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Pound Estimate</label>
                <input
                    type="number"
                    className={inputClass}
                    value={poundEstimate}
                    onChange={(e) => setPoundEstimate(e.target.value)}
                    required
                />

                <label className="mt-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Crew Size</label>
                <input
                    type="number"
                    className={inputClass}
                    value={crewSize}
                    onChange={(e) => setCrewSize(e.target.value)}
                    required
                />

                <input
                    type="submit"
                    value="Submit"
                    className="col-span-2 mt-4 cursor-pointer rounded-lg border border-purple-400 bg-purple-500/10 p-3 text-sm font-semibold uppercase tracking-wide text-purple-300 transition-colors hover:bg-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                />
            </form>

            {/* === Previous Estimates List === */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-start gap-5">
                <h2 className="col-span-full text-2xl font-semibold uppercase tracking-widest text-cyan-300">Previous Estimates</h2>

                {estimates.map((est) => {
                    const notesOpen = openNotesIds.has(est.id)
                    const draft = noteDrafts[est.id] || { title: "", content: "" }

                    return (
                        <div
                            key={est.id}
                            className="flex flex-col gap-1.5 rounded-xl border border-cyan-500/25 bg-black/45 p-5 shadow-[0_0_15px_rgba(34,211,238,0.1)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                        >

                            {editingId === est.id ? (
                                <>
                                    <input
                                        name="customer_name"
                                        className={inputClass}
                                        value={editForm.customer_name}
                                        onChange={handleEditChange}
                                    />

                                    <input
                                        name="square_footage"
                                        type="number"
                                        className={inputClass}
                                        value={editForm.square_footage}
                                        onChange={handleEditChange}
                                    />

                                    <input
                                        name="pound_estimate"
                                        type="number"
                                        className={inputClass}
                                        value={editForm.pound_estimate}
                                        onChange={handleEditChange}
                                    />

                                    <input
                                        name="crew_size"
                                        type="number"
                                        className={inputClass}
                                        value={editForm.crew_size}
                                        onChange={handleEditChange}
                                    />

                                    <button
                                        onClick={() => updateEstimate(est.id)}
                                        className="mt-1.5 w-full rounded-lg border border-cyan-400 bg-cyan-500/10 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="w-full rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-300">Customer Name: {est.customer_name}</p>
                                    <p className="text-sm text-slate-300">Square Footage: {est.square_footage}</p>
                                    <p className="text-sm text-slate-300">Pound Estimate: {est.pound_estimate}</p>
                                    <p className="text-sm text-slate-300">Crew Size: {est.crew_size}</p>
                                    <p className="text-sm text-slate-300">
                                        Total Price:
                                        <strong className="mt-1.5 block text-2xl font-bold text-purple-300 [text-shadow:0_0_12px_rgba(192,132,252,0.6)]">${est.price}</strong>
                                    </p>
                                    <p className="text-sm text-slate-300">Created: {new Date(est.created_at).toLocaleString()}</p>
                                    <p className="text-sm text-slate-300">Last Updated: {new Date(est.updated_at).toLocaleString()}</p>
                                    <button
                                        onClick={() => startEdit(est)}
                                        className="mt-1.5 w-full rounded-lg border border-cyan-400 bg-cyan-500/10 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-cyan-300 transition-colors hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteEstimate(est.id)}
                                        className="w-full rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => toggleNotes(est.id)}
                                className="w-full rounded-lg border border-purple-400/60 bg-purple-500/10 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-purple-300 transition-colors hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            >
                                {notesOpen ? "Hide Notes" : "Show Notes"}
                            </button>

                            {notesOpen && (
                                <div className="mt-2.5 flex flex-col gap-2 border-t border-cyan-500/20 pt-2.5">
                                    {(est.notes || []).map((note) => (
                                        <Note note={note} onDelete={deleteNote} key={note.id} />
                                    ))}

                                    <form onSubmit={(e) => createNote(est.id, e)} className="flex flex-col gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="Note title"
                                            className={inputClass}
                                            value={draft.title}
                                            onChange={(e) => updateNoteDraft(est.id, "title", e.target.value)}
                                            required
                                        />
                                        <textarea
                                            placeholder="Note details"
                                            className={`${inputClass} min-h-[60px] resize-y`}
                                            value={draft.content}
                                            onChange={(e) => updateNoteDraft(est.id, "content", e.target.value)}
                                            required
                                        />
                                        <input
                                            type="submit"
                                            value="Save Note"
                                            className="w-full cursor-pointer rounded-lg border border-purple-400 bg-purple-500/10 py-2 text-sm font-semibold uppercase tracking-wide text-purple-300 transition-colors hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                        />
                                    </form>
                                </div>
                            )}
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default Estimate
