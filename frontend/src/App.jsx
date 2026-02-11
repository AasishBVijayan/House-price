import { useState } from "react"
import axios from "axios"

const predictPrice = async () => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/predict", {
      overall_qual: Number(form.overall_qual),
      gr_liv_area: Number(form.gr_liv_area),
      garage_cars: Number(form.garage_cars),
      total_bsmt_sf: Number(form.total_bsmt_sf),
      full_bath: Number(form.full_bath),
      year_built: Number(form.year_built)
    })

    alert(`Predicted Price: ₹ ${response.data.predicted_price}`)
  } catch (error) {
    alert("Error predicting price")
  }
}

function App() {
  const [form, setForm] = useState({
    overall_qual: "",
    gr_liv_area: "",
    garage_cars: "",
    total_bsmt_sf: "",
    full_bath: "",
    year_built: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700">
          House Price Predictor
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Enter house details to estimate the price
        </p>

        <form className="mt-8 space-y-5">
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replaceAll("_", " ")}
              </label>
              <input
                type="number"
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder={`Enter ${key.replaceAll("_", " ")}`}
              />
            </div>
          ))}

          <button type="button" onClick={predictPrice} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            Predict Price
          </button>

        </form>
      </div>
    </div>
  )
}

export default App
