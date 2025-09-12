'use client'
import React, { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

export default function Page() {
    const mapRef = useRef<HTMLDivElement | null>(null)
    const leafletMap = useRef<any>(null)
    const baseLayersRef = useRef<any>({})
    const overlaysRef = useRef<any>({})
    const [selectedLocation, setSelectedLocation] = useState<string>('')
    const [coords, setCoords] = useState<string>('')
    const [showLocationInfo, setShowLocationInfo] = useState(false)
    const [areaValue, setAreaValue] = useState<string>('0 sq.m')
    // Keep minimal map initialization for initial UX; the comprehensive script will reinitialize/augment when loaded.
    useEffect(() => {
        const L = (window as any).L
        if (!L || !mapRef.current || leafletMap.current) return

        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        })
        const map = L.map(mapRef.current, {
            center: [20.5937, 78.9629],
            zoom: 5,
            layers: [osm],
        })
        leafletMap.current = map
        baseLayersRef.current = { osm }

        L.circleMarker([28.6139, 77.209], { radius: 6, color: '#1FB8CD', fill: true }).addTo(map)
        L.circleMarker([19.076, 72.8777], { radius: 6, color: '#1FB8CD', fill: true }).addTo(map)

        map.on('click', (e: any) => {
            const lat = e.latlng.lat.toFixed(6)
            const lng = e.latlng.lng.toFixed(6)
            setSelectedLocation(`Lat: ${lat}, Lng: ${lng}`)
            setCoords(`${lat}, ${lng}`)
            setShowLocationInfo(true)
        })

        return () => {
            map.remove()
            leafletMap.current = null
        }
    }, [])

    // Legend toggle behavior
    useEffect(() => {
        const btn = document.getElementById('toggleLegend')
        const legend = document.getElementById('mapLegend')
        const content = document.getElementById('legendContent')
        if (!btn || !legend || !content) return
        const onClick = () => {
            const collapsed = legend.classList.toggle('collapsed')
            content.style.display = collapsed ? 'none' : 'block'
            btn.textContent = collapsed ? '+' : '−'
            btn.setAttribute('aria-expanded', String(!collapsed))
        }
        btn.addEventListener('click', onClick)
        return () => btn.removeEventListener('click', onClick)
    }, [])

    const handleBaseMapChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const val = ev.target.value
        const L = (window as any).L
        if (!L || !leafletMap.current) return
        const map = leafletMap.current
        Object.values(baseLayersRef.current).forEach((layer: any) => map.removeLayer(layer))
        if (val === 'satellite' && baseLayersRef.current.satellite) {
            baseLayersRef.current.satellite.addTo(map)
        } else if (baseLayersRef.current.osm) {
            baseLayersRef.current.osm.addTo(map)
        }
    }

    const handleLayerToggle = (id: string, checked: boolean) => {
        const map = leafletMap.current
        if (!map) return
        const overlays = overlaysRef.current as any
        if (id === 'layerLithology') {
            checked ? overlays.lithologyLayer.addTo(map) : map.removeLayer(overlays.lithologyLayer)
        } else if (id === 'layerRainfall') {
            checked ? overlays.rainfallLayer.addTo(map) : map.removeLayer(overlays.rainfallLayer)
        } else if (id === 'layerGroundwater') {
            checked ? overlays.gwLayer.addTo(map) : map.removeLayer(overlays.gwLayer)
        }
    }

    const startMeasure = () => {
        const L = (window as any).L
        const map = leafletMap.current
        if (!L || !map) return
        const drawBtn = document.querySelector('.leaflet-draw-draw-polygon, .leaflet-draw-draw-rectangle') as HTMLElement | null
        if (drawBtn) drawBtn.click()
        const display = document.getElementById('areaDisplay')
        if (display) display.style.display = 'block'
    }

    return (
        <>
            {/* Tailwind CDN */}
            <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                key="leaflet-css"
            />
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"
                key="leaflet-draw-css"
            />

            <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
            <Script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js" strategy="beforeInteractive" />
            <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" />

            <header className="bg-white dark:bg-gray-800">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="py-6">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100">🌧️ Advanced Rainwater Harvesting GIS Tool</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">
                            Central Ground Water Board (CGWB) - Government of India | Comprehensive Offline Assessment
                        </p>
                    </div>
                </div>
            </header>

            <main className="py-6">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="lg:flex lg:gap-6">
                        <aside className="w-full lg:w-80 flex-shrink-0">
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
                                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Map Controls</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select base map and data layers</p>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Base Map</label>
                                        <div className="flex flex-col gap-2" onChange={handleBaseMapChange}>
                                            <label className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <input type="radio" name="baseMap" value="osm" defaultChecked className="cursor-pointer" />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Standard Map</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <input type="radio" name="baseMap" value="satellite" className="cursor-pointer" />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Satellite View</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data Layers</label>
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <input
                                                    type="checkbox"
                                                    id="layerLithology"
                                                    defaultChecked
                                                    onChange={(e) => handleLayerToggle('layerLithology', e.target.checked)}
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Lithology/Geology</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <input
                                                    type="checkbox"
                                                    id="layerRainfall"
                                                    defaultChecked
                                                    onChange={(e) => handleLayerToggle('layerRainfall', e.target.checked)}
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Rainfall Zones</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <input
                                                    type="checkbox"
                                                    id="layerGroundwater"
                                                    defaultChecked
                                                    onChange={(e) => handleLayerToggle('layerGroundwater', e.target.checked)}
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Groundwater Depth</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <button id="measureAreaBtn" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-2" onClick={startMeasure}>
                                            📐 Measure Roof Area
                                        </button>
                                        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-md p-3 hidden" id="areaDisplay">
                                            <span className="block text-xs text-slate-500">Selected Area:</span>
                                            <span className="block text-lg font-semibold text-emerald-600" id="areaValue">
                                                {areaValue}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
                                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Property Assessment</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Click anywhere on map to get location data</p>
                                </div>
                                <div className="p-4">
                                    <form id="assessmentForm" className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                        <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selected Location</label>
                                            <input type="text" id="location" className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" placeholder="Click on map to select location" readOnly value={selectedLocation} />
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2" id="locationCoords">
                                                {coords}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Name</label>
                                            <input id="userName" className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" placeholder="Optional" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Number of Dwellers</label>
                                            <input id="dwellers" type="number" defaultValue={4} className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Roof Area (sq.m)</label>
                                            <input id="roofArea" type="number" defaultValue={0} className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Open Space (sq.m)</label>
                                            <input id="openSpace" type="number" defaultValue={0} className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
                                        </div>

                                        <div>
                                            <button id="measureAreaBtnLocal" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-2" onClick={startMeasure}>
                                                📐 Measure Roof Area
                                            </button>
                                            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-md p-3 hidden" id="areaDisplayLocal">
                                                <span className="block text-xs text-slate-500">Selected Area:</span>
                                                <span className="block text-lg font-semibold text-emerald-600" id="areaValueLocal">
                                                    {areaValue}
                                                </span>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
                                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Property Assessment</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Click anywhere on map to get location data</p>
                                </div>
                                <div className="p-4">
                                    <form id="assessmentFormCalc" className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                        <div>
                                            <label htmlFor="locationCalc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selected Location</label>
                                            <input type="text" id="locationCalc" className="w-full px-3 py-2 text-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" placeholder="Click on map to select location" readOnly value={selectedLocation} />
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2" id="locationCoordsCalc">
                                                {coords}
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-md py-2">
                                            🔬 Calculate Harvesting Potential
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <div className="text-sm text-emerald-700 font-medium">🟢 Ready - All data pre-loaded</div>
                            </div>
                        </aside>

                        <section className="flex-1 mt-6 lg:mt-0">
                            <div className="relative">
                                <div id="map" className="w-full h-[80vh] min-h-[600px] rounded-md border border-gray-100 dark:border-gray-700" ref={mapRef} />

                                {/* Map Legend (keeps same structure and inline styles from original) */}
                                <div className="absolute top-4 right-4 z-50" id="mapLegend" style={{ width: 360 }}>
                                    <style>{`
                                        /* Keep the internal legend styles (colors/structure) as-is; Tailwind handles layout */
                                        #mapLegend .legend-header { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
                                        #mapLegend .legend-toggle { background: rgba(255,255,255,0.9); border: none; font-size: 18px; cursor: pointer; padding: 4px 8px; color: #000000; border-radius: 6px; }
                                        #mapLegend .legend-content { display:block; max-height:72vh; overflow:auto; padding-right:6px; }
                                        #mapLegend.collapsed .legend-content { display:none; }
                                    `}</style>

                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 shadow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">🗺️ Map Legend</h4>
                                            <button id="toggleLegend" className="legend-toggle" aria-expanded="true">−</button>
                                        </div>

                                        <div className="legend-content" id="legendContent">
                                            <div className="space-y-3">
                                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">🪨 Lithology Types</h5>
                                                <div className="bg-white dark:bg-gray-900 rounded-md p-2 border border-gray-50 dark:border-gray-800">
                                                    <div className="space-y-2">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-4 h-4 rounded-sm" style={{ background: '#C1440E' }} />
                                                            <div>
                                                                <div className="font-semibold text-sm">Basalt</div>
                                                                <div className="text-xs text-slate-500">Columnar flows · Fractured zones</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-4 h-4 rounded-sm" style={{ background: '#6A994E' }} />
                                                            <div>
                                                                <div className="font-semibold text-sm">Alluvium</div>
                                                                <div className="text-xs text-slate-500">Sands / Gravels · High infiltration</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">🌧️ Rainfall Zones (mm/year)</h5>
                                                <div className="bg-white dark:bg-gray-900 rounded-md p-2 border border-gray-50 dark:border-gray-800">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm" style={{ background: '#BDE0FE' }} /><div className="text-sm"> &lt; 500 mm · <span className="text-xs text-slate-500">Arid / semi-arid</span></div></div>
                                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm" style={{ background: '#90CDF4' }} /><div className="text-sm">500–1000 mm · <span className="text-xs text-slate-500">Moderate</span></div></div>
                                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm" style={{ background: '#219EBC' }} /><div className="text-sm">&gt; 1000 mm · <span className="text-xs text-slate-500">High rainfall</span></div></div>
                                                    </div>
                                                </div>

                                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">🌊 Groundwater Depth (meters)</h5>
                                                <div className="bg-white dark:bg-gray-900 rounded-md p-2 border border-gray-50 dark:border-gray-800">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm" style={{ background: '#FDE68A' }} /><div className="text-sm">0–5 m · <span className="text-xs text-slate-500">Very shallow</span></div></div>
                                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm" style={{ background: '#FDBA74' }} /><div className="text-sm">5–15 m · <span className="text-xs text-slate-500">Accessible</span></div></div>
                                                        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-sm" style={{ background: '#FB7185' }} /><div className="text-sm">&gt; 15 m · <span className="text-xs text-slate-500">Deep</span></div></div>
                                                    </div>
                                                </div>

                                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">🏙️ Major Cities</h5>
                                                <div className="bg-white dark:bg-gray-900 rounded-md p-2 border border-gray-50 dark:border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-4 h-4 rounded-full" style={{ background: '#1FB8CD' }} />
                                                        <div className="text-sm">City Markers · <span className="text-xs text-slate-500">Major urban centres</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4`} id="locationInfo" style={{ display: showLocationInfo ? 'block' : 'none' }}>
                                <div className="mb-3">
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">📊 Location Analysis</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-50 dark:border-gray-800">
                                        <div className="text-xs text-slate-500">🪨 Lithology:</div>
                                        <div id="lithologyType" className="font-medium">—</div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-50 dark:border-gray-800">
                                        <div className="text-xs text-slate-500">🌧️ Annual Rainfall:</div>
                                        <div id="rainfallData" className="font-medium">—</div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-50 dark:border-gray-800">
                                        <div className="text-xs text-slate-500">🌊 Groundwater Depth:</div>
                                        <div id="gwDepthData" className="font-medium">—</div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-50 dark:border-gray-800">
                                        <div className="text-xs text-slate-500">📍 Nearest City:</div>
                                        <div id="nearestCity" className="font-medium">—</div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-50 dark:border-gray-800 md:col-span-2">
                                        <div className="text-xs text-slate-500">📏 Elevation:</div>
                                        <div id="elevation" className="font-medium">—</div>
                                    </div>
                                </div>
                                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">💧 Recharge Potential</h5>
                                    <div className="mt-2 bg-sky-50 rounded-md p-3 text-sm text-slate-500 dark:text-slate-300" id="rechargeDetails">
                                        Click map to load local analysis (placeholder)
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Minimal results modal + spinner placeholders preserved */}
            <div id="resultsModal" className="hidden" />
            <div id="loadingSpinner" className="hidden" />
        </>
    )
}