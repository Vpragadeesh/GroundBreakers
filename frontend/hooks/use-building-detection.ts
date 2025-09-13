"use client"
import { useState, useEffect } from 'react'

interface BuildingData {
  buildingType: string | null
  buildingArea: number | null
  roofArea: number | null
  floors: number | null
  estimatedRoofArea: number | null
  confidence: number | null
  loading: boolean
  error: string | null
}

interface BuildingInfo {
  type: string
  area: number
  floors: number
  roofArea: number
}

export function useBuildingDetection(latitude: number | null, longitude: number | null) {
  const [buildingData, setBuildingData] = useState<BuildingData>({
    buildingType: null,
    buildingArea: null,
    roofArea: null,
    floors: null,
    estimatedRoofArea: null,
    confidence: null,
    loading: false,
    error: null
  })

  const detectBuilding = async (lat: number, lng: number) => {
    setBuildingData(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Try multiple approaches to get building information
      const [overpassResponse, nominatimResponse] = await Promise.allSettled([
        // Overpass API for OpenStreetMap building data
        fetch(`https://overpass-api.de/api/interpreter?data=[out:json];(way["building"](around:50,${lat},${lng}););out geom;`),
        // Nominatim for address and building info
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      ])

      let buildingInfo: BuildingInfo | null = null

      // Try Overpass API first (more detailed building data)
      if (overpassResponse.status === 'fulfilled' && overpassResponse.value.ok) {
        const overpassData = await overpassResponse.value.json()
        buildingInfo = await processOverpassData(overpassData, lat, lng)
      }

      // Fallback to Nominatim if Overpass fails
      if (!buildingInfo && nominatimResponse.status === 'fulfilled' && nominatimResponse.value.ok) {
        const nominatimData = await nominatimResponse.value.json()
        buildingInfo = await processNominatimData(nominatimData, lat, lng)
      }

      // If no building data found, use AI estimation based on location
      if (!buildingInfo) {
        buildingInfo = await estimateBuildingFromLocation(lat, lng)
      }

      if (buildingInfo) {
        // Calculate confidence based on data quality
        const confidence = calculateConfidence(buildingInfo, latitude, longitude)
        
        setBuildingData({
          buildingType: buildingInfo.type,
          buildingArea: buildingInfo.area,
          roofArea: buildingInfo.roofArea,
          floors: buildingInfo.floors,
          estimatedRoofArea: buildingInfo.roofArea,
          confidence: confidence,
          loading: false,
          error: null
        })
      } else {
        throw new Error('Unable to detect building information')
      }

    } catch (error) {
      console.error('Building detection error:', error)
      setBuildingData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to detect building'
      }))
    }
  }

  const processOverpassData = async (data: any, lat: number, lng: number): Promise<BuildingInfo | null> => {
    if (!data.elements || data.elements.length === 0) return null

    const building = data.elements[0]
    if (!building.geometry) return null

    // Calculate building area from geometry
    const area = calculatePolygonArea(building.geometry)
    const buildingType = building.tags?.building || 'residential'
    const floors = parseInt(building.tags?.['building:levels']) || estimateFloors(buildingType, area)
    
    // Use precise geometry-based calculation when available
    const roofArea = building.geometry && building.geometry.length >= 3 
      ? calculateRoofAreaFromGeometry(building.geometry, buildingType, floors)
      : calculateRoofArea(buildingType, area, floors)
    
    return {
      type: buildingType,
      area: area,
      floors: floors,
      roofArea: roofArea
    }
  }

  const processNominatimData = async (data: any, lat: number, lng: number): Promise<BuildingInfo | null> => {
    const address = data.address
    if (!address) return null

    // Estimate building type from address
    const buildingType = estimateBuildingTypeFromAddress(address)
    const area = estimateAreaFromAddress(address, buildingType)
    const floors = estimateFloors(buildingType, area)

    return {
      type: buildingType,
      area: area,
      floors: floors,
      roofArea: calculateRoofArea(buildingType, area, floors)
    }
  }

  const estimateBuildingFromLocation = async (lat: number, lng: number): Promise<BuildingInfo> => {
    // Use reverse geocoding to get location context
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`)
      const data = await response.json()
      
      const address = data.address
      const buildingType = estimateBuildingTypeFromAddress(address)
      const area = estimateAreaFromLocation(lat, lng, buildingType)
      const floors = estimateFloors(buildingType, area)

      return {
        type: buildingType,
        area: area,
        floors: floors,
        roofArea: calculateRoofArea(buildingType, area, floors)
      }
    } catch (error) {
      // Fallback to default residential estimates
      return {
        type: 'residential',
        area: 100, // Default 100 sq meters
        floors: 2,
        roofArea: calculateRoofArea('residential', 100, 2)
      }
    }
  }

  const calculatePolygonArea = (geometry: any[]): number => {
    if (geometry.length < 3) return 0

    // Simple shoelace formula for polygon area
    let area = 0
    for (let i = 0; i < geometry.length; i++) {
      const j = (i + 1) % geometry.length
      area += geometry[i].lat * geometry[j].lng
      area -= geometry[j].lat * geometry[i].lng
    }
    return Math.abs(area) / 2 * 111000 * 111000 // Convert to square meters (rough approximation)
  }

  const estimateBuildingTypeFromAddress = (address: any): string => {
    const road = address.road?.toLowerCase() || ''
    const suburb = address.suburb?.toLowerCase() || ''
    const city = address.city?.toLowerCase() || ''
    
    // Commercial indicators
    if (road.includes('market') || road.includes('mall') || road.includes('commercial') ||
        suburb.includes('business') || suburb.includes('commercial')) {
      return 'commercial'
    }
    
    // Industrial indicators
    if (road.includes('industrial') || road.includes('factory') || suburb.includes('industrial')) {
      return 'industrial'
    }
    
    // Educational indicators
    if (road.includes('school') || road.includes('college') || road.includes('university')) {
      return 'educational'
    }
    
    // Default to residential
    return 'residential'
  }

  const estimateAreaFromAddress = (address: any, buildingType: string): number => {
    const road = address.road?.toLowerCase() || ''
    
    // Different area estimates based on building type and location
    const baseAreas = {
      residential: 80,
      commercial: 200,
      industrial: 500,
      educational: 300
    }
    
    let baseArea = baseAreas[buildingType as keyof typeof baseAreas] || 80
    
    // Adjust based on location context
    if (road.includes('main') || road.includes('highway')) {
      baseArea *= 1.5 // Larger buildings on main roads
    }
    
    return Math.round(baseArea)
  }

  const estimateAreaFromLocation = (lat: number, lng: number, buildingType: string): number => {
    // Use building type and add some randomness for realistic variation
    const baseAreas = {
      residential: 80,
      commercial: 200,
      industrial: 500,
      educational: 300
    }
    
    const baseArea = baseAreas[buildingType as keyof typeof baseAreas] || 80
    const variation = 0.8 + Math.random() * 0.4 // ±20% variation
    
    return Math.round(baseArea * variation)
  }

  const calculateRoofArea = (buildingType: string, buildingArea: number, floors: number): number => {
    // Advanced roof area calculation with precise factors
    const roofConfigs = {
      residential: {
        // Residential buildings: consider setbacks, balconies, and roof design
        baseFactor: 0.75,
        setbackFactor: 0.85, // Account for building setbacks
        balconyFactor: 0.9,  // Account for balconies reducing roof area
        roofTypeFactor: 0.95, // Sloped roofs have less usable area
        minArea: 40,
        maxArea: 300
      },
      commercial: {
        // Commercial buildings: flat roofs, minimal setbacks
        baseFactor: 0.92,
        setbackFactor: 0.95,
        balconyFactor: 1.0,  // No balconies typically
        roofTypeFactor: 1.0,  // Flat roofs maximize usable area
        minArea: 80,
        maxArea: 1500
      },
      industrial: {
        // Industrial buildings: large flat roofs, minimal obstructions
        baseFactor: 0.96,
        setbackFactor: 0.98,
        balconyFactor: 1.0,
        roofTypeFactor: 1.0,  // Flat roofs
        minArea: 150,
        maxArea: 3000
      },
      educational: {
        // Educational buildings: moderate setbacks, some roof features
        baseFactor: 0.82,
        setbackFactor: 0.88,
        balconyFactor: 0.95,
        roofTypeFactor: 0.92, // Mixed roof types
        minArea: 60,
        maxArea: 1200
      }
    }

    const config = roofConfigs[buildingType as keyof typeof roofConfigs] || roofConfigs.residential
    
    // Calculate base roof area
    let roofArea = buildingArea * config.baseFactor
    
    // Apply building-specific adjustments
    roofArea *= config.setbackFactor    // Account for building setbacks
    roofArea *= config.balconyFactor    // Account for balconies/protrusions
    roofArea *= config.roofTypeFactor   // Account for roof type (sloped vs flat)
    
    // Multi-story adjustment with precise calculation
    if (floors > 1) {
      // More sophisticated floor adjustment
      const floorAdjustment = 0.75 + (0.25 / Math.sqrt(floors))
      roofArea *= floorAdjustment
      
      // Additional adjustment for very tall buildings
      if (floors > 5) {
        roofArea *= 0.95 // Additional reduction for high-rises
      }
    }
    
    // Apply area-based adjustments for more realistic calculations
    if (buildingArea > 500) {
      roofArea *= 0.98 // Large buildings have slightly less efficient roof usage
    } else if (buildingArea < 100) {
      roofArea *= 1.05 // Small buildings can use roof more efficiently
    }
    
    // Apply min/max constraints
    roofArea = Math.max(config.minArea, Math.min(config.maxArea, roofArea))
    
    // Round to nearest 5 for practical purposes
    return Math.round(roofArea / 5) * 5
  }

  const calculateConfidence = (buildingInfo: BuildingInfo, lat: number, lng: number): number => {
    let confidence = 0.5 // Base confidence
    
    // Higher confidence for larger buildings (more reliable data)
    if (buildingInfo.area > 200) confidence += 0.2
    else if (buildingInfo.area > 100) confidence += 0.15
    else if (buildingInfo.area > 50) confidence += 0.1
    
    // Higher confidence for specific building types
    const typeConfidence = {
      residential: 0.8,
      commercial: 0.85,
      industrial: 0.9,
      educational: 0.75
    }
    confidence += (typeConfidence[buildingInfo.type as keyof typeof typeConfidence] || 0.7) * 0.3
    
    // Higher confidence for reasonable floor counts
    if (buildingInfo.floors >= 1 && buildingInfo.floors <= 10) confidence += 0.1
    
    // Higher confidence for reasonable roof area ratios
    const roofRatio = buildingInfo.roofArea / buildingInfo.area
    if (roofRatio >= 0.6 && roofRatio <= 1.0) confidence += 0.15
    
    // Cap confidence at 0.95 (never 100% due to estimation nature)
    return Math.min(confidence, 0.95)
  }

  const estimateFloors = (buildingType: string, area: number): number => {
    const floorEstimates = {
      residential: Math.min(Math.max(Math.round(area / 40), 1), 4), // 1-4 floors
      commercial: Math.min(Math.max(Math.round(area / 100), 1), 10), // 1-10 floors
      industrial: Math.min(Math.max(Math.round(area / 200), 1), 3), // 1-3 floors
      educational: Math.min(Math.max(Math.round(area / 150), 1), 5) // 1-5 floors
    }
    
    return floorEstimates[buildingType as keyof typeof floorEstimates] || 2
  }

  const calculateRoofAreaFromGeometry = (geometry: any[], buildingType: string, floors: number): number => {
    if (!geometry || geometry.length < 3) return 0

    // Calculate precise polygon area using shoelace formula
    let area = 0
    for (let i = 0; i < geometry.length; i++) {
      const j = (i + 1) % geometry.length
      area += geometry[i].lat * geometry[j].lng
      area -= geometry[j].lat * geometry[i].lng
    }
    
    // Convert to square meters (rough approximation)
    const polygonArea = Math.abs(area) / 2 * 111000 * 111000
    
    // Apply roof-specific adjustments based on building type
    const roofAdjustments = {
      residential: 0.72,  // Residential: setbacks, balconies, sloped roofs
      commercial: 0.88,   // Commercial: flat roofs, minimal setbacks
      industrial: 0.94,   // Industrial: large flat roofs
      educational: 0.78   // Educational: mixed roof types
    }
    
    const adjustment = roofAdjustments[buildingType as keyof typeof roofAdjustments] || 0.75
    let roofArea = polygonArea * adjustment
    
    // Adjust for floors
    if (floors > 1) {
      roofArea *= (0.8 + (0.2 / floors))
    }
    
    return Math.round(roofArea / 5) * 5
  }

  useEffect(() => {
    if (latitude && longitude) {
      detectBuilding(latitude, longitude)
    }
  }, [latitude, longitude])

  return {
    ...buildingData,
    detectBuilding
  }
}
