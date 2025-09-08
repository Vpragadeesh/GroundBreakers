import { useMemo, useState } from 'react'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'k'
  return n.toLocaleString()
}

export default function WaterYieldCalculator() {
  const [area, setArea] = useState<number>(100) // m^2
  const [rainfall, setRainfall] = useState<number>(800) // mm/year
  const [runoff, setRunoff] = useState<number>(0.8) // coefficient (0-1)

  const harvestedLiters = useMemo(() => {
    const A = clamp(Number(area) || 0, 0, 1e7)
    const R = clamp(Number(rainfall) || 0, 0, 1e5)
    const C = clamp(Number(runoff) || 0, 0, 1)
    // 1 mm rainfall on 1 m^2 = 1 liter
    return A * R * C
  }, [area, rainfall, runoff])

  const harvestedCubic = useMemo(() => harvestedLiters / 1000, [harvestedLiters])

  const presets = [
    { label: 'Concrete', c: 0.8 },
    { label: 'Tiled', c: 0.6 },
    { label: 'Thatched', c: 0.5 },
    { label: 'Paved', c: 0.95 },
  ]

  const copyResult = async () => {
    const txt = `Harvested: ${harvestedLiters.toFixed(0)} L (~${harvestedCubic.toFixed(2)} m³) for A=${area} m², R=${rainfall} mm, C=${runoff}`
    try {
      await navigator.clipboard.writeText(txt)
      // eslint-disable-next-line no-alert
      alert('Result copied to clipboard')
    } catch {
      // fallback
      // eslint-disable-next-line no-alert
      alert(txt)
    }
  }

  return (
    <section className="py-12 container mx-auto px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 bg-gradient-to-b from-sky-50 to-white">
          <h3 className="text-2xl font-bold text-slate-800">Water Yield Calculator</h3>
          <p className="text-sm text-slate-500 mt-2">Estimate rooftop rainwater harvest using: <span className="font-semibold">Harvested Rainwater = A × R × C</span></p>

          <div className="mt-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">A — Rooftop area (m²)</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="range"
                  min={0}
                  max={2000}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  className="w-28 border rounded px-3 py-1"
                  value={area}
                  min={0}
                  onChange={(e) => setArea(clamp(Number(e.target.value) || 0, 0, 1e7))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">R — Annual rainfall (mm)</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  className="w-28 border rounded px-3 py-1"
                  value={rainfall}
                  min={0}
                  onChange={(e) => setRainfall(clamp(Number(e.target.value) || 0, 0, 1e5))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">C — Runoff coefficient (0–1)</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={runoff}
                  onChange={(e) => setRunoff(Number(e.target.value))}
                  className="w-full"
                />
                <input
                  type="number"
                  step={0.01}
                  className="w-28 border rounded px-3 py-1"
                  value={runoff}
                  min={0}
                  max={1}
                  onChange={(e) => setRunoff(clamp(Number(e.target.value) || 0, 0, 1))}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    className={`px-3 py-1 rounded-md text-sm border ${p.c === runoff ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700'}`}
                    onClick={() => setRunoff(p.c)}
                    type="button"
                  >
                    {p.label} ({p.c})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">Harvested Rainwater</div>
              <div className="text-4xl font-extrabold text-sky-700 mt-2">{fmt(harvestedLiters)} <span className="text-xl font-medium">L</span></div>
              <div className="text-sm text-slate-500 mt-1">(~{harvestedCubic.toFixed(2)} m³)</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Calculation</div>
              <div className="font-mono bg-slate-50 px-3 py-2 rounded mt-2 border">{area} × {rainfall} × {runoff}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={copyResult} className="px-4 py-2 bg-sky-600 text-white rounded-md shadow">Copy result</button>
            <a
              className="px-4 py-2 border rounded-md text-slate-700 hover:bg-slate-50"
              href={`data:text/plain,Harvested%20${harvestedLiters.toFixed(0)}%20L%20(~${harvestedCubic.toFixed(2)}%20m3)%20for%20A=${area}m2,R=${rainfall}mm,C=${runoff}`}
              download={`rwh_${Date.now()}.txt`}
            >
              Download
            </a>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <p className="mb-1 font-medium">Notes</p>
            <ul className="list-disc pl-5">
              <li>1 mm rainfall over 1 m² = 1 litre of water; formula therefore returns litres.</li>
              <li>Typical runoff coefficients: concrete ~0.8, tiled ~0.6, thatch lower.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
