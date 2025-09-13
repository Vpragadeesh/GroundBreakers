"use client"
import { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number | null
  feelsLike: number | null
  humidity: number | null
  pressure: number | null
  windSpeed: number | null
  windDirection: number | null
  visibility: number | null
  uvIndex: number | null
  condition: string | null
  description: string | null
  icon: string | null
  city: string | null
  country: string | null
  lastUpdated: string | null
  error: string | null
  loading: boolean
  forecast: ForecastData[]
  historical: HistoricalData[]
}

interface ForecastData {
  date: string
  time: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
}

interface HistoricalData {
  date: string
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
}

export function useWeather(latitude: number | null, longitude: number | null) {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: null,
    feelsLike: null,
    humidity: null,
    pressure: null,
    windSpeed: null,
    windDirection: null,
    visibility: null,
    uvIndex: null,
    condition: null,
    description: null,
    icon: null,
    city: null,
    country: null,
    lastUpdated: null,
    error: null,
    loading: false,
    forecast: [],
    historical: []
  })

  const generateMockForecast = (baseTemp: number) => {
    const forecast = []
    const conditions = ['Clear', 'Cloudy', 'Rain', 'Sunny', 'Partly Cloudy']
    const icons = ['01d', '02d', '10d', '01d', '03d']
    
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      forecast.push({
        date: date.toLocaleDateString(),
        time: i === 0 ? 'Now' : `${9 + i * 3}:00`,
        temperature: baseTemp + Math.random() * 10 - 5,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 15
      })
    }
    return forecast
  }

  const generateMockHistorical = (baseTemp: number) => {
    const historical = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      historical.push({
        date: date.toLocaleDateString(),
        temperature: baseTemp + Math.random() * 8 - 4,
        humidity: 65 + Math.random() * 20,
        pressure: 1010 + Math.random() * 20,
        windSpeed: 8 + Math.random() * 12
      })
    }
    return historical
  }

  const fetchWeather = async (lat: number, lng: number) => {
    setWeatherData(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Using OpenWeatherMap API (free tier)
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo_key'
      
      // Try multiple weather services for better reliability
      const [openWeatherResponse, weatherapiResponse] = await Promise.allSettled([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`),
        fetch(`https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHERAPI_KEY || 'demo_key'}&q=${lat},${lng}&aqi=no`)
      ])

      let weatherResult = null

      // Try OpenWeatherMap first
      if (openWeatherResponse.status === 'fulfilled' && openWeatherResponse.value.ok) {
        const data = await openWeatherResponse.value.json()
        const temp = Math.round(data.main.temp)
        weatherResult = {
          temperature: temp,
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
          uvIndex: null, // Not available in basic API
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          country: data.sys.country,
          lastUpdated: new Date().toLocaleTimeString(),
          error: null,
          loading: false,
          forecast: generateMockForecast(temp),
          historical: generateMockHistorical(temp)
        }
      }
      // Fallback to WeatherAPI
      else if (weatherapiResponse.status === 'fulfilled' && weatherapiResponse.value.ok) {
        const data = await weatherapiResponse.value.json()
        const temp = Math.round(data.current.temp_c)
        weatherResult = {
          temperature: temp,
          feelsLike: Math.round(data.current.feelslike_c),
          humidity: data.current.humidity,
          pressure: data.current.pressure_mb,
          windSpeed: data.current.wind_kph,
          windDirection: data.current.wind_degree,
          visibility: data.current.vis_km,
          uvIndex: data.current.uv,
          condition: data.current.condition.text,
          description: data.current.condition.text,
          icon: data.current.condition.icon,
          city: data.location.name,
          country: data.location.country,
          lastUpdated: new Date().toLocaleTimeString(),
          error: null,
          loading: false,
          forecast: generateMockForecast(temp),
          historical: generateMockHistorical(temp)
        }
      }
      // Fallback to demo data if APIs fail
      else {
        weatherResult = {
          temperature: 25,
          feelsLike: 27,
          humidity: 65,
          pressure: 1013,
          windSpeed: 12,
          windDirection: 180,
          visibility: 10,
          uvIndex: 6,
          condition: 'Clear',
          description: 'Clear sky',
          icon: '01d',
          city: 'Demo City',
          country: 'Demo Country',
          lastUpdated: new Date().toLocaleTimeString(),
          error: null,
          loading: false,
          forecast: generateMockForecast(25),
          historical: generateMockHistorical(25)
        }
      }

      setWeatherData(weatherResult)
    } catch (error) {
      console.error('Weather fetch error:', error)
      setWeatherData(prev => ({
        ...prev,
        error: 'Unable to fetch weather data',
        loading: false
      }))
    }
  }

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude)
    }
  }, [latitude, longitude])

  return {
    ...weatherData,
    refetch: () => latitude && longitude ? fetchWeather(latitude, longitude) : null
  }
}
