"use client"
import { Cloud, Sun, Droplets, Wind, Eye, Thermometer, Gauge, RefreshCw, Loader2, AlertCircle, TrendingUp, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWeather } from "@/hooks/use-weather"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface WeatherCardProps {
  latitude: number | null
  longitude: number | null
  city: string | null
  country: string | null
}

function getWeatherIcon(condition: string | null, icon: string | null) {
  if (icon && icon.startsWith('01')) return <Sun className="h-8 w-8 text-yellow-500" />
  if (icon && icon.startsWith('02') || icon && icon.startsWith('03')) return <Cloud className="h-8 w-8 text-gray-500" />
  if (icon && icon.startsWith('09') || icon && icon.startsWith('10')) return <Droplets className="h-8 w-8 text-blue-500" />
  if (condition?.toLowerCase().includes('rain')) return <Droplets className="h-8 w-8 text-blue-500" />
  if (condition?.toLowerCase().includes('cloud')) return <Cloud className="h-8 w-8 text-gray-500" />
  if (condition?.toLowerCase().includes('clear') || condition?.toLowerCase().includes('sunny')) return <Sun className="h-8 w-8 text-yellow-500" />
  return <Cloud className="h-8 w-8 text-gray-500" />
}

function getWindDirection(degrees: number | null) {
  if (!degrees) return 'N/A'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function WeatherCard({ latitude, longitude, city, country }: WeatherCardProps) {
  const {
    temperature,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    windDirection,
    visibility,
    uvIndex,
    condition,
    description,
    icon,
    lastUpdated,
    error,
    loading,
    forecast,
    historical,
    refetch
  } = useWeather(latitude, longitude)

  if (!latitude || !longitude) {
    return null
  }

  return (
    <div className="mx-4 mb-6">
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                {loading ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : error ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  getWeatherIcon(condition, icon)
                )}
              </div>
              
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {loading ? "Loading weather..." : 
                   error ? "Weather unavailable" : 
                   `${city || 'Current Location'}, ${country || ''}`}
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {loading ? "Fetching weather data..." : 
                   error ? error : 
                   `${condition || 'Unknown'} - ${description || ''}`}
                </div>
              </div>
            </div>

            {error && refetch && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
                className="h-9 px-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            )}
          </div>
        </CardHeader>

        {!loading && !error && (
          <CardContent className="pt-0">
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Current
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Forecast
                </TabsTrigger>
                <TabsTrigger value="historical" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4 mt-4">
                {/* Main Weather Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-foreground">
                      {temperature}°C
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Feels like {feelsLike}°C</div>
                      <div className="text-xs">{lastUpdated}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getWeatherIcon(condition, icon)}
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{humidity}%</div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Wind className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">{windSpeed} km/h</div>
                      <div className="text-xs text-muted-foreground">{getWindDirection(windDirection)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Gauge className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium">{pressure} hPa</div>
                      <div className="text-xs text-muted-foreground">Pressure</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Eye className="h-4 w-4 text-indigo-500" />
                    <div>
                      <div className="text-sm font-medium">{visibility} km</div>
                      <div className="text-xs text-muted-foreground">Visibility</div>
                    </div>
                  </div>
                </div>

                {/* UV Index */}
                {uvIndex && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium">UV Index: {uvIndex}</div>
                      <div className="text-xs text-muted-foreground">
                        {uvIndex <= 2 ? 'Low' : 
                         uvIndex <= 5 ? 'Moderate' : 
                         uvIndex <= 7 ? 'High' : 
                         uvIndex <= 10 ? 'Very High' : 'Extreme'}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="forecast" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">7-Day Forecast</h3>
                  
                  {/* Forecast Chart */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Forecast Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {forecast.slice(0, 6).map((day, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">{day.date}</div>
                          <div className="text-lg font-bold">{day.temperature}°C</div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{day.condition}</span>
                          <span>{day.humidity}% humidity</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="historical" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Historical Data (7 Days)</h3>
                  
                  {/* Temperature Chart */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historical}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Multi-metric Chart */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historical}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="humidity" fill="#3b82f6" name="Humidity %" />
                        <Bar dataKey="windSpeed" fill="#10b981" name="Wind Speed km/h" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Historical Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="text-sm font-medium">Avg Temp</div>
                      <div className="text-lg font-bold">
                        {Math.round(historical.reduce((sum, day) => sum + day.temperature, 0) / historical.length)}°C
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="text-sm font-medium">Avg Humidity</div>
                      <div className="text-lg font-bold">
                        {Math.round(historical.reduce((sum, day) => sum + day.humidity, 0) / historical.length)}%
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="text-sm font-medium">Avg Pressure</div>
                      <div className="text-lg font-bold">
                        {Math.round(historical.reduce((sum, day) => sum + day.pressure, 0) / historical.length)} hPa
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="text-sm font-medium">Avg Wind</div>
                      <div className="text-lg font-bold">
                        {Math.round(historical.reduce((sum, day) => sum + day.windSpeed, 0) / historical.length)} km/h
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}

        {loading && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">Loading weather data...</p>
              </div>
            </div>
          </CardContent>
        )}

        {error && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">Weather data unavailable</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}