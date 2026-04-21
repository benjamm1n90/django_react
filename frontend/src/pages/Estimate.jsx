// import { useState, useEffect } from "react"
// import api from "../api"
// import "../styles/Estimate.css"

// function Estimate() {

//     const [estimates, setEstimates] = useState([])
//     const [customerName, setCustomerName] = useState("")
//     const [squareFootage, setSquareFootage] = useState("")
//     const [poundEstimate, setPoundEstimate] = useState("")
//     const [crewSize, setCrewSize] = useState("")
//     const [editingId, setEditingId] = useState(null)
//     const [editForm, setEditForm] = useState({
//         customer_name: "",
//         square_footage: "",
//         pound_estimate: "",
//         crew_size: ""
//     })
//     useEffect(() => {
//         getEstimates()
//     }, [])

//     const getEstimates = () => {
//         api
//             .get("/api/estimates/")
//             .then((res) => res.data)
//             .then((data) => setEstimates(data))
//             .catch((err) => alert(err))
//     }

//     const createEstimate = (e) => {
//         e.preventDefault()
//         api
//             .post("/api/estimates/", {
//                 customer_name: customerName,
//                 square_footage: squareFootage,
//                 pound_estimate: poundEstimate,
//                 crew_size: crewSize
//             })
//             .then((res) => {
//                 setEstimates([res.data, ...estimates])
//                 setCustomerName("")
//                 setSquareFootage("")
//                 setPoundEstimate("")
//                 setCrewSize("")
//             })
//             .catch((err) => alert(err))
//     }
//     const startEdit = (est) => {
//         setEditingId(est.id)
//         setEditForm({
//             customer_name: est.customer_name,
//             square_footage: est.square_footage,
//             pound_estimate: est.pound_estimate,
//             crew_size: est.crew_size
//         })
//     }
//     const handleEditChange = (e) => {
//         setEditForm({
//             ...editForm,
//             [e.target.name]: e.target.value
//         })
//     }
//     const updateEstimate = (id) => {
//         api
//             .patch(`/api/estimates/update/${id}/`, editForm)
//             .then((res) => {
//                 setEstimates((prev) =>
//                     prev.map((est) =>
//                         est.id === id ? res.data : est
//                     )
//                 )
//                 setEditingId(null)
//             })
//             .catch((err) => alert(err))
//     }
//     const deleteEstimate = (id) => {
//         api
//             .delete(`/api/estimates/delete/${id}/`)
//             .then((res) => {
//                 if (res.status === 204) alert("Estimate deleted successfully");
//                 else alert("Failed to delete estimate");
//                 getEstimates();
//             })
//             .catch((error) => alert(error));
//         getEstimates()
//     };
//     return (
//         <div>
//             {/* === Create Estimate Form === */}
//             <h2>Create a New Estimate</h2>
//             <form onSubmit={createEstimate} className="estimator-form">
//                 <label htmlFor="customerName">Customer Name</label>
//                 <input
//                     type="text"
//                     id="customerName"
//                     value={customerName}
//                     onChange={(e) => setCustomerName(e.target.value)}
//                     required
//                 />
//                 <label>Square Footage</label>
//                 <input
//                     type="number"
//                     value={squareFootage}
//                     onChange={(e) => setSquareFootage(e.target.value)}
//                     required
//                 />

//                 <label>Pound Estimate</label>
//                 <input
//                     type="number"
//                     value={poundEstimate}
//                     onChange={(e) => setPoundEstimate(e.target.value)}
//                     required
//                 />

//                 <label>Crew Size</label>
//                 <input
//                     type="number"
//                     value={crewSize}
//                     onChange={(e) => setCrewSize(e.target.value)}
//                     required
//                 />

//                 <input type="submit" value="Submit" />
//             </form>

//             {/* === Previous Estimates List === */}
//             <div>
//                 <h2>Previous Estimates</h2>
//                 {estimates.map((est) => (
//                     <div key={est.id} className="estimate-result">
//                         <p>Customer Name: {est.customer_name}</p>
//                         <p>Square Footage: {est.square_footage}</p>
//                         <p>Pound Estimate: {est.pound_estimate}</p>
//                         <p>Crew Size: {est.crew_size}</p>
//                         <p><strong>Total Price: ${est.price}</strong></p>
//                         <p>Created: {new Date(est.created_at).toLocaleString()}</p>
//                         <button onClick={() => deleteEstimate(est.id)}>
//                             Delete
//                         </button>
//                         <hr />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default Estimate
import { useState, useEffect } from "react"
import api from "../api"
import "../styles/Estimate.css"

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

    return (
        <div>

            {/* === Create Estimate Form === */}
            <h2>Create a New Estimate</h2>
            <form onSubmit={createEstimate} className="estimator-form">

                <label>Customer Name</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                />

                <label>Square Footage</label>
                <input
                    type="number"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(e.target.value)}
                    required
                />

                <label>Pound Estimate</label>
                <input
                    type="number"
                    value={poundEstimate}
                    onChange={(e) => setPoundEstimate(e.target.value)}
                    required
                />

                <label>Crew Size</label>
                <input
                    type="number"
                    value={crewSize}
                    onChange={(e) => setCrewSize(e.target.value)}
                    required
                />

                <input type="submit" value="Submit" />
            </form>

            {/* === Previous Estimates List === */}
            <div>
                <h2>Previous Estimates</h2>

                {estimates.map((est) => (
                    <div key={est.id} className="estimate-result">

                        {editingId === est.id ? (
                            <>
                                <input
                                    name="customer_name"
                                    value={editForm.customer_name}
                                    onChange={handleEditChange}
                                />

                                <input
                                    name="square_footage"
                                    type="number"
                                    value={editForm.square_footage}
                                    onChange={handleEditChange}
                                />

                                <input
                                    name="pound_estimate"
                                    type="number"
                                    value={editForm.pound_estimate}
                                    onChange={handleEditChange}
                                />

                                <input
                                    name="crew_size"
                                    type="number"
                                    value={editForm.crew_size}
                                    onChange={handleEditChange}
                                />

                                <button onClick={() => updateEstimate(est.id)}>
                                    Save
                                </button>

                                <button onClick={() => setEditingId(null)}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <p>Customer Name: {est.customer_name}</p>
                                <p>Square Footage: {est.square_footage}</p>
                                <p>Pound Estimate: {est.pound_estimate}</p>
                                <p>Crew Size: {est.crew_size}</p>
                                <p><strong>Total Price: ${est.price}</strong></p>
                                <p>Created: {new Date(est.created_at).toLocaleString()}</p>
                                <p>Last Updated: {new Date(est.updated_at).toLocaleString()}</p>
                                <button onClick={() => startEdit(est)}>
                                    Edit
                                </button>

                                <button onClick={() => deleteEstimate(est.id)}>
                                    Delete
                                </button>
                            </>
                        )}

                        <hr />
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Estimate