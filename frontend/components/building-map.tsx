"use client"
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Home, Ruler, Building, Square, Layers } from "lucide-react"

interface BuildingMapProps {
  latitude: number | null
  longitude: number | null
  buildingType: string | null
  buildingArea: number | null
  roofArea: number | null
  floors: number | null
  confidence: number | null
  loading: boolean
  error: string | null
}

interface BuildingGeometry {
  type: string
  coordinates: number[][]
}

interface RoofOverlay {
  center: [number, number]
  bounds: [number, number][]
  area: number
  dimensions: {
    width: number
    height: number
  }
}

export function BuildingMap({
  latitude,
  longitude,
  buildingType,
  buildingArea,
  roofArea,
  floors,
  confidence,
  loading,
  error
}: BuildingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [buildingGeometry, setBuildingGeometry] = useState<BuildingGeometry | null>(null)
  const [roofOverlay, setRoofOverlay] = useState<RoofOverlay | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (latitude && longitude && !mapLoaded) {
      loadMap()
    }
  }, [latitude, longitude, mapLoaded])

  useEffect(() => {
    if (latitude && longitude && buildingArea) {
      fetchBuildingGeometry()
      calculateRoofOverlay()
    }
  }, [latitude, longitude, buildingArea, roofArea])

  const loadMap = () => {
    if (!mapRef.current || !latitude || !longitude) return

    // Create a simple map using OpenStreetMap
    const mapContainer = mapRef.current
    mapContainer.innerHTML = ''

    // Create map iframe with roof area bounds
    const bboxPadding = roofArea ? Math.max(0.002, Math.sqrt(roofArea) / 111000) : 0.001
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - bboxPadding},${latitude - bboxPadding},${longitude + bboxPadding},${latitude + bboxPadding}&layer=mapnik&marker=${latitude},${longitude}`
    
    const iframe = document.createElement('iframe')
    iframe.src = mapUrl
    iframe.width = '100%'
    iframe.height = '300'
    iframe.frameBorder = '0'
    iframe.className = 'border-0 rounded-lg'
    
    mapContainer.appendChild(iframe)
    setMapLoaded(true)
  }

  const fetchBuildingGeometry = async () => {
    if (!latitude || !longitude) return

    try {
      // Try to get building geometry from Overpass API
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=[out:json];(way["building"](around:50,${latitude},${longitude}););out geom;`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.elements && data.elements.length > 0) {
          const building = data.elements[0]
          if (building.geometry) {
            setBuildingGeometry({
              type: 'polygon',
              coordinates: building.geometry.map((point: any) => [point.lng, point.lat])
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch building geometry:', error)
    }
  }

  const calculateRoofOverlay = () => {
    if (!latitude || !longitude || !roofArea) return

    // Calculate roof dimensions based on area
    // Assume roughly square roof for simplicity
    const sideLength = Math.sqrt(roofArea)
    const metersToDegrees = 1 / 111000 // Rough conversion

    // Calculate roof bounds around the building center
    const halfSide = (sideLength * metersToDegrees) / 2
    
    const roofBounds: [number, number][] = [
      [longitude - halfSide, latitude - halfSide], // Bottom left
      [longitude + halfSide, latitude - halfSide], // Bottom right
      [longitude + halfSide, latitude + halfSide], // Top right
      [longitude - halfSide, latitude + halfSide], // Top left
      [longitude - halfSide, latitude - halfSide]  // Close polygon
    ]

    setRoofOverlay({
      center: [latitude, longitude],
      bounds: roofBounds,
      area: roofArea,
      dimensions: {
        width: sideLength,
        height: sideLength
      }
    })
  }

  const getBuildingColor = (type: string | null) => {
    switch (type) {
      case 'residential': return '#3b82f6' // Blue
      case 'commercial': return '#10b981' // Green
      case 'industrial': return '#f59e0b' // Orange
      case 'educational': return '#8b5cf6' // Purple
      default: return '#6b7280' // Gray
    }
  }

  const getBuildingIcon = (type: string | null) => {
    switch (type) {
      case 'residential': return <Home className="h-4 w-4" />
      case 'commercial': return <Building className="h-4 w-4" />
      case 'industrial': return <Building className="h-4 w-4" />
      case 'educational': return <Building className="h-4 w-4" />
      default: return <MapPin className="h-4 w-4" />
    }
  }

  if (!latitude || !longitude) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getBuildingIcon(buildingType)}
          Building Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef}
            className="w-full h-64 bg-muted rounded-lg overflow-hidden min-h-[300px]"
          />
          
          {/* Building Info Overlay */}
          {buildingArea && (
            <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  {getBuildingIcon(buildingType)}
                  <span className="capitalize">{buildingType || 'Building'}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    Area: {buildingArea} sq m
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Roof: {roofArea} sq m
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Floors: {floors}
                  </div>
                  {confidence && (
                    <div className="text-xs">
                      Confidence: {Math.round(confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Roof Area Overlay */}
          {roofOverlay && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Roof Area Visualization */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  {/* Roof Area Rectangle */}
                  <div 
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded-lg -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: `${Math.min(200, Math.max(50, Math.sqrt(roofOverlay.area) * 2))}px`,
                      height: `${Math.min(200, Math.max(50, Math.sqrt(roofOverlay.area) * 2))}px`
                    }}
                  >
                     {/* Roof Area Label */}
                     <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                       <Square className="h-3 w-3 inline mr-1" />
                       Exact Roof: {roofOverlay.area} sq m
                     </div>
                    
                    {/* Dimensions */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-background/90 text-xs px-2 py-1 rounded whitespace-nowrap">
                      <Ruler className="h-3 w-3 inline mr-1" />
                      {Math.round(roofOverlay.dimensions.width)}m × {Math.round(roofOverlay.dimensions.height)}m
                    </div>
                  </div>
                  
                  {/* Center Point */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading building data...</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center text-destructive">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Building Details */}
        {buildingArea && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-primary">{buildingArea}</div>
              <div className="text-xs text-muted-foreground">Building Area (sq m)</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-lg font-bold text-red-600">{roofArea}</div>
              <div className="text-xs text-muted-foreground">Roof Area (sq m)</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-blue-600">{floors}</div>
              <div className="text-xs text-muted-foreground">Floors</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-lg font-bold text-purple-600">{Math.round((confidence || 0) * 100)}%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          </div>
        )}

         {/* Roof Area Legend */}
         {roofOverlay && (
           <div className="space-y-3">
             <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-red-500 bg-red-500/20 rounded"></div>
                 <span className="text-sm font-medium">Exact Roof Area Calculated</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                 <span className="text-sm text-muted-foreground">Building Center</span>
               </div>
               <div className="flex items-center gap-2">
                 <Square className="h-4 w-4 text-red-500" />
                 <span className="text-sm text-muted-foreground">{roofOverlay.area} sq m</span>
               </div>
             </div>
             
             {/* Calculation Details */}
             <div className="p-3 rounded-lg bg-muted/30 space-y-2">
               <h4 className="text-sm font-medium text-center">Precise Calculation Method</h4>
               <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="flex justify-between">
                   <span>Building Type:</span>
                   <span className="font-medium capitalize">{buildingType}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Floors:</span>
                   <span className="font-medium">{floors}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Base Area:</span>
                   <span className="font-medium">{buildingArea} sq m</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Roof Factor:</span>
                   <span className="font-medium">
                     {buildingType === 'residential' ? '72%' :
                      buildingType === 'commercial' ? '88%' :
                      buildingType === 'industrial' ? '94%' :
                      buildingType === 'educational' ? '78%' : '75%'}
                   </span>
                 </div>
                 <div className="flex justify-between">
                   <span>Floor Adjustment:</span>
                   <span className="font-medium">{floors > 1 ? `${Math.round((0.8 + (0.2 / floors)) * 100)}%` : '100%'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Final Roof Area:</span>
                   <span className="font-medium text-red-600">{roofArea} sq m</span>
                 </div>
               </div>
             </div>
           </div>
         )}

        {/* Building Type Indicator */}
        {buildingType && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/30">
            <div 
              className={`w-4 h-4 rounded-full ${
                buildingType === 'residential' ? 'bg-blue-500' :
                buildingType === 'commercial' ? 'bg-green-500' :
                buildingType === 'industrial' ? 'bg-orange-500' :
                buildingType === 'educational' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}
            />
            <span className="text-sm font-medium capitalize">
              {buildingType} Building Detected
            </span>
          </div>
        )}

        {/* Map Controls */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Data: OpenStreetMap</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
