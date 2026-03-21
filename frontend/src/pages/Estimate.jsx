// import { useState } from "react"
// import api from "../api"
// import "../styles/Estimate.css"

// function Estimate() {

//     const [squareFootage, setSquareFootage] = useState("")
//     const [poundEstimate, setPoundEstimate] = useState("")
//     const [crewSize, setCrewSize] = useState("")
//     const [estimate, setEstimate] = useState([null])
//     const [estimates, setEstimates] = useState([])


//     useEffect(() => {
//         getEstimates()
//     }, [])

//     const createEstimate = (e) => {
//         e.preventDefault()

//         api
//             .post("/api/estimates/", {
//                 square_footage: squareFootage,
//                 pound_estimate: poundEstimate,
//                 crew_size: crewSize
//             })
//             .then((res) => {
//                 setEstimate(res.data)
//                 getEstimates()
//             })
//             .catch((err) => alert(err))
//     }

//     const getEstimates = () => {
//         api
//             .get("/api/estimates/")
//             .then((res) => res.data)
//             .then((data) => {
//                 setEstimates(data)
//             })
//             .catch((err) => alert(err))
//     }

//     return (
//         <div className="estimator-container">

//             <h2>Moving Estimate Calculator</h2>

//             <form className="estimator-form" onSubmit={createEstimate}>

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

//                 <input type="submit" value="Calculate Estimate" />

//             </form>

//             {estimate && (
//                 <div className="estimate-result">

//                     <h3>Estimate Result</h3>

//                     <p>Square Footage: {estimate.square_footage}</p>
//                     <p>Pound Estimate: {estimate.pound_estimate}</p>
//                     <p>Crew Size: {estimate.crew_size}</p>
//                     <p><strong>Total Price: ${estimate.price}</strong></p>
//                     <p>Created: {estimate.created_at}</p>

//                 </div>
//             )}

//             <h2>Previous Estimates</h2>

//             <table className="estimate-table">
//                 <thead>
//                     <tr>
//                         <th>Square Footage</th>
//                         <th>Pounds</th>
//                         <th>Crew Size</th>
//                         <th>Price</th>
//                         <th>Date</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {estimates.map((est) => (
//                         <tr key={est.id}>
//                             <td>{est.square_footage}</td>
//                             <td>{est.pound_estimate}</td>
//                             <td>{est.crew_size}</td>
//                             <td>${est.price}</td>
//                             <td>{new Date(est.created_at).toLocaleDateString()}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//         </div>
//     )
// }

// export default Estimate
import { useState, useEffect } from "react"
import api from "../api"
import "../styles/Estimate.css"

function Estimate() {

    const [estimates, setEstimates] = useState([])
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
                square_footage: squareFootage,
                pound_estimate: poundEstimate,
                crew_size: crewSize
            })
            .then((res) => {
                // Immediately add the new estimate to the top of the list
                setEstimates([res.data, ...estimates])
                // Clear form fields
                setSquareFootage("")
                setPoundEstimate("")
                setCrewSize("")
            })
            .catch((err) => alert(err))
    }

    return (
        <div>
            {/* === Create Estimate Form === */}
            <h2>Create a New Estimate</h2>
            <form onSubmit={createEstimate} className="estimator-form">
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
                        <p>Square Footage: {est.square_footage}</p>
                        <p>Pound Estimate: {est.pound_estimate}</p>
                        <p>Crew Size: {est.crew_size}</p>
                        <p><strong>Total Price: ${est.price}</strong></p>
                        <p>Created: {new Date(est.created_at).toLocaleString()}</p>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Estimate