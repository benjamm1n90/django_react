import { useState, useEffect } from "react"
import api from "../api"
import "../styles/Estimate.css"

function Estimate() {

    const [estimates, setEstimates] = useState([])
    const [customerName, setCustomerName] = useState("")
    const [squareFootage, setSquareFootage] = useState("")
    const [poundEstimate, setPoundEstimate] = useState("")
    const [crewSize, setCrewSize] = useState("")

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
                setEstimates([res.data, ...estimates])
                setCustomerName("")
                setSquareFootage("")
                setPoundEstimate("")
                setCrewSize("")
            })
            .catch((err) => alert(err))
    }
    const deleteEstimate = (id) => {
        api
            .delete(`/api/estimates/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Estimate deleted successfully");
                else alert("Failed to delete estimate");
                getEstimates();
            })
            .catch((error) => alert(error));
        getEstimates()
    };
    return (
        <div>
            {/* === Create Estimate Form === */}
            <h2>Create a New Estimate</h2>
            <form onSubmit={createEstimate} className="estimator-form">
                <label htmlFor="customerName">Customer Name</label>
                <input
                    type="text"
                    id="customerName"
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
                        <p>Customer Name: {est.customer_name}</p>
                        <p>Square Footage: {est.square_footage}</p>
                        <p>Pound Estimate: {est.pound_estimate}</p>
                        <p>Crew Size: {est.crew_size}</p>
                        <p><strong>Total Price: ${est.price}</strong></p>
                        <p>Created: {new Date(est.created_at).toLocaleString()}</p>
                        <button onClick={() => deleteEstimate(est.id)}>
                            Delete
                        </button>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Estimate