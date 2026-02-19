import { useState } from "react";
import axios from "axios";
import { 
  Ruler, 
  Car, 
  LayoutDashboard, 
  Bath, 
  Calendar, 
  Info,
  Home
} from "lucide-react";

const inputConfig = [
  { key: "gr_liv_area", label: "Living Area", desc: "Above-ground living space", icon: Ruler, unit: "sq.ft", min: 100, max: 20000, type: "number" },
  { key: "total_bsmt_sf", label: "Basement Area", desc: "Finished + unfinished", icon: LayoutDashboard, unit: "sq.ft", min: 0, max: 10000, type: "number" },
  { key: "garage_cars", label: "Garage Capacity", desc: "Number of vehicles", icon: Car, unit: "cars", min: 0, max: 10, type: "number" },
  { key: "full_bath", label: "Full Bathrooms", desc: "Count of full baths", icon: Bath, unit: "baths", min: 0, max: 10, type: "number" },
  { key: "year_built", label: "Year Built", desc: "Original construction year", icon: Calendar, unit: "", min: 1800, max: new Date().getFullYear(), type: "number" }
];

function App() {
  const [form, setForm] = useState({
    overall_qual: 6,
    gr_liv_area: 1500,
    garage_cars: 2,
    total_bsmt_sf: 1000,
    full_bath: 2,
    year_built: 1990
  });

  // Store the raw number instead of a formatted string
  const [rawPrice, setRawPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state to track the selected currency
  const [currency, setCurrency] = useState("USD");

  const EXCHANGE_RATE = 90; // Approx 1 USD = 90 INR

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const predictPrice = async () => {
    try {
      setLoading(true);
      setRawPrice(null);
      setError(null);

      const response = await axios.post("http://127.0.0.1:8000/predict", {
        overall_qual: Number(form.overall_qual),
        gr_liv_area: Number(form.gr_liv_area),
        garage_cars: Number(form.garage_cars),
        total_bsmt_sf: Number(form.total_bsmt_sf),
        full_bath: Number(form.full_bath),
        year_built: Number(form.year_built)
      });

      // Save the raw, unformatted number returned from FastAPI
      setRawPrice(response.data.predicted_price);
    } catch (err) {
      setError("Unable to connect to the prediction engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamically calculate the display string based on the selected currency toggle
  let displayPrice = "";
  if (rawPrice) {
    if (currency === "USD") {
      displayPrice = "$" + rawPrice.toLocaleString("en-US", { maximumFractionDigits: 0 });
    } else {
      displayPrice = "₹" + (rawPrice * EXCHANGE_RATE).toLocaleString("en-IN", { maximumFractionDigits: 0 });
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 flex items-center justify-center px-4 py-12 font-sans">
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 md:p-12 text-slate-100">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl mb-6 shadow-lg shadow-indigo-500/10">
            <Home size={36} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            AI Property Valuation
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-lg">
            Enter the property details below for an instant, machine-learning powered market estimate.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          
          <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 relative group">
                <label className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                  Overall Quality
                </label>
                <Info size={16} className="text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-slate-800 text-xs text-slate-300 p-3 rounded-lg border border-slate-600 shadow-xl z-10">
                  Rate the material & finish quality of the house. <br/><br/>
                  <span className="font-bold text-white">1-4:</span> Poor/Fair <br/>
                  <span className="font-bold text-white">5-6:</span> Average <br/>
                  <span className="font-bold text-white">7-10:</span> Good/Luxury
                </div>
              </div>
              <span className="text-lg font-bold bg-indigo-500/20 text-indigo-300 px-4 py-1 rounded-lg border border-indigo-500/30">
                {form.overall_qual} <span className="text-indigo-500/50 text-sm">/ 10</span>
              </span>
            </div>
            
            <input
              type="range"
              name="overall_qual"
              min="1"
              max="10"
              value={form.overall_qual}
              onChange={handleChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>Poor Condition</span>
              <span>Luxury Custom</span>
            </div>
          </div>

          {inputConfig.map((field) => (
            <div key={field.key} className="space-y-2 relative group">
              <label className="block text-sm font-semibold text-slate-300">
                {field.label}
              </label>
              
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <field.icon size={20} />
                </div>
                
                <input
                  type="number"
                  name={field.key}
                  min={field.min}
                  max={field.max}
                  value={form[field.key]}
                  onChange={handleChange}
                  className="w-full pl-12 pr-16 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-white placeholder-slate-600 transition-all font-medium text-lg shadow-inner"
                />
                
                {field.unit && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">{field.unit}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-400 text-sm text-center flex items-center justify-center space-x-2">
            <Info size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={predictPrice}
            disabled={loading}
            className={`w-full md:w-auto min-w-[300px] px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center mx-auto space-x-3
              ${loading
                ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1"
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing Model...</span>
              </>
            ) : (
              <span>Estimate Property Value</span>
            )}
          </button>
        </div>

        {rawPrice && !loading && !error && (
          <div className="mt-12 overflow-hidden relative bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border border-emerald-500/30 p-10 rounded-2xl text-center shadow-2xl animate-[pulse_1s_ease-in-out_1]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            
            {/* Currency Toggle inside the result card */}
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-slate-900/80 p-1 rounded-lg inline-flex border border-slate-700/50 shadow-inner">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                    currency === "USD" 
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setCurrency("INR")}
                  className={`px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                    currency === "INR" 
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  INR (₹)
                </button>
              </div>
            </div>

            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2 relative z-10">
              Estimated Market Value
            </h2>
            <div className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-100 drop-shadow-sm relative z-10">
              {displayPrice}
            </div>
            <p className="text-sm mt-6 text-emerald-300/60 font-medium relative z-10">
              Real-time modeling based on Ames Data
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;