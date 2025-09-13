"use client"
import { MapPin, RefreshCw, AlertCircle, Loader2, Navigation, Satellite, Map, Mountain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocation } from "@/hooks/use-location"
import { useState } from "react"

interface EmbeddedMapProps {
  latitude: number
  longitude: number
  address: string
}

type MapView = 'street' | 'satellite' | 'terrain' | 'hybrid'

function EmbeddedMap({ latitude, longitude, address }: EmbeddedMapProps) {
  const [mapView, setMapView] = useState<MapView>('hybrid')
  
  const getMapUrl = (view: MapView) => {
    const baseUrl = 'https://www.google.com/maps/embed/v1/view'
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey || apiKey === 'AIzaSyDsj2AwoVbvGIH-dbYllIFTHddjZCrA1-E') {
      switch (view) {
        case 'satellite':
          return `https://www.bing.com/maps/embed?h=400&w=800&cp=${latitude}~${longitude}&lvl=15&typ=s&sty=a&src=SHELL&FORM=MBEDV8`
        case 'terrain':
          return `https://opentopomap.org/#map=15/${latitude}/${longitude}`
        case 'hybrid':
          return `https://maps.google.com/maps?q=${latitude},${longitude}&t=h&z=15&output=embed`
        default:
          return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`
      }
    }
    
    const mapTypes = {
      street: 'roadmap',
      satellite: 'satellite', 
      terrain: 'terrain',
      hybrid: 'hybrid'
    }
    
    return `${baseUrl}?key=${apiKey}&center=${latitude},${longitude}&zoom=15&maptype=${mapTypes[view]}`
  }

  const mapUrl = getMapUrl(mapView)
  
  return (
    <div className="space-y-3">
      {/* Map View Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Map View:</span>
        <div className="flex gap-1">
          <Button
            variant={mapView === 'street' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapView('street')}
            className="h-8 px-3 text-xs"
          >
            <Map className="h-3 w-3 mr-1" />
            Street
          </Button>
          <Button
            variant={mapView === 'satellite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapView('satellite')}
            className="h-8 px-3 text-xs"
          >
            <Satellite className="h-3 w-3 mr-1" />
            Satellite
          </Button>
          <Button
            variant={mapView === 'terrain' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapView('terrain')}
            className="h-8 px-3 text-xs"
          >
            <Mountain className="h-3 w-3 mr-1" />
            Terrain
          </Button>
          <Button
            variant={mapView === 'hybrid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMapView('hybrid')}
            className="h-8 px-3 text-xs"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Hybrid
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-80 rounded-lg overflow-hidden border border-border bg-muted/20">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map - ${address} - ${mapView} view`}
          className="rounded-lg border-0"
        />
        
        {/* Custom Location Marker Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="relative">
            {/* Pulsing circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500/30 rounded-full animate-ping"></div>
            {/* Main marker */}
            <div className="relative w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
            </div>
            {/* Label */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              You are here
            </div>
          </div>
        </div>

        {/* Map Links */}
        <div className="absolute bottom-2 right-2 flex gap-2 z-10">
          <a 
            href={`https://www.google.com/maps?q=${latitude},${longitude}&t=${mapView === 'satellite' ? 'k' : mapView === 'terrain' ? 'p' : 'm'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Google Maps
          </a>
          <a 
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  )
}

export function LocationDisplay() {
  const { 
    latitude, 
    longitude, 
    city, 
    state, 
    country, 
    address,
    postalCode,
    neighborhood,
    district,
    area,
    landmark,
    formattedAddress,
    error, 
    loading, 
    getCurrentLocation,
    hasLocation 
  } = useLocation()

  const formatExactLocation = () => {
    if (!hasLocation) return "Location not detected"
    
    // Use formatted address if available, otherwise fallback to city, state, country
    if (formattedAddress && formattedAddress !== 'Unknown City, Unknown State, Unknown Country') {
      return formattedAddress
    }
    
    const parts = [city, state, country].filter(Boolean)
    return parts.join(", ") || "Location detected"
  }

  const formatDetailedLocation = () => {
    if (!hasLocation) return "Location not detected"
    
    const details = []
    
    if (neighborhood) details.push(neighborhood)
    if (area) details.push(area)
    if (district) details.push(district)
    if (city) details.push(city)
    if (state) details.push(state)
    if (postalCode) details.push(postalCode)
    if (country) details.push(country)
    
    return details.join(", ") || formattedAddress || "Location detected"
  }

  const formatCoordinates = () => {
    if (!hasLocation) return ""
    return `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`
  }

  return (
    <div className="mx-4 mb-6">
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                {loading ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : error ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary" />
                )}
              </div>
              
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {loading ? "Detecting your location..." : 
                   error ? "Location unavailable" : 
                   formatExactLocation()}
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {loading ? "Please allow location access..." : 
                   error ? error : 
                   formatCoordinates()}
                </div>
              </div>
            </div>

            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={loading}
                className="h-9 px-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            )}
          </div>
        </CardHeader>

        {hasLocation && !loading && !error && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Navigation className="h-4 w-4" />
                  <span>Exact location: {formatDetailedLocation()}</span>
                </div>
                {landmark && (
                  <div className="text-xs text-muted-foreground ml-6">
                    Near: {landmark}
                  </div>
                )}
                {postalCode && (
                  <div className="text-xs text-muted-foreground ml-6">
                    Postal Code: {postalCode}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Interactive Map with Multiple Views</h4>
                <EmbeddedMap 
                  latitude={latitude!} 
                  longitude={longitude!} 
                  address={formatExactLocation()} 
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}