"use client"
import { useState, useEffect } from 'react'

interface LocationData {
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  neighborhood: string | null
  district: string | null
  area: string | null
  landmark: string | null
  formattedAddress: string | null
  error: string | null
  loading: boolean
}

interface GeolocationPosition {
  coords: {
    latitude: number
    longitude: number
  }
}

export function useLocation() {
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: null,
    longitude: null,
    address: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    neighborhood: null,
    district: null,
    area: null,
    landmark: null,
    formattedAddress: null,
    error: null,
    loading: false
  })

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationData(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }))
      return
    }

    setLocationData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      
      // Reverse geocoding to get address
      const addressData = await reverseGeocode(latitude, longitude)
      
      setLocationData({
        latitude,
        longitude,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postalCode: addressData.postalCode,
        neighborhood: addressData.neighborhood,
        district: addressData.district,
        area: addressData.area,
        landmark: addressData.landmark,
        formattedAddress: addressData.formattedAddress,
        error: null,
        loading: false
      })
    } catch (error) {
      let errorMessage = 'Unable to retrieve your location'
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
      }
      
      setLocationData(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Try multiple geocoding services for comprehensive data
      const [bigDataResponse, nominatimResponse] = await Promise.allSettled([
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`),
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`)
      ])

      let bigDataResult = null
      let nominatimResult = null

      if (bigDataResponse.status === 'fulfilled' && bigDataResponse.value.ok) {
        bigDataResult = await bigDataResponse.value.json()
      }

      if (nominatimResponse.status === 'fulfilled' && nominatimResponse.value.ok) {
        nominatimResult = await nominatimResponse.value.json()
      }

      // Extract detailed information from both services
      const address = nominatimResult?.display_name || bigDataResult?.localityInfo?.administrative?.[0]?.name || 'Location detected'
      const city = bigDataResult?.city || nominatimResult?.address?.city || nominatimResult?.address?.town || nominatimResult?.address?.village || 'Unknown City'
      const state = bigDataResult?.principalSubdivision || nominatimResult?.address?.state || 'Unknown State'
      const country = bigDataResult?.countryName || nominatimResult?.address?.country || 'Unknown Country'
      const postalCode = nominatimResult?.address?.postcode || bigDataResult?.postcode || null
      const neighborhood = nominatimResult?.address?.suburb || nominatimResult?.address?.neighbourhood || bigDataResult?.localityInfo?.administrative?.[2]?.name || null
      const district = nominatimResult?.address?.district || nominatimResult?.address?.county || bigDataResult?.localityInfo?.administrative?.[1]?.name || null
      const area = nominatimResult?.address?.area || nominatimResult?.address?.hamlet || null
      const landmark = nominatimResult?.address?.amenity || nominatimResult?.address?.building || null

      // Create formatted address
      const addressParts = [neighborhood, city, state, country].filter(Boolean)
      const formattedAddress = addressParts.join(', ')

      return {
        address,
        city,
        state,
        country,
        postalCode,
        neighborhood,
        district,
        area,
        landmark,
        formattedAddress
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return {
        address: 'Location detected',
        city: 'Unknown City',
        state: 'Unknown State', 
        country: 'Unknown Country',
        postalCode: null,
        neighborhood: null,
        district: null,
        area: null,
        landmark: null,
        formattedAddress: 'Unknown City, Unknown State, Unknown Country'
      }
    }
  }

  useEffect(() => {
    // Auto-detect location on mount
    getCurrentLocation()
  }, [])

  return {
    ...locationData,
    getCurrentLocation,
    hasLocation: locationData.latitude !== null && locationData.longitude !== null
  }
}
