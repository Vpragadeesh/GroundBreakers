"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Calculator,
  MapPin,
  TrendingUp,
  Ruler,
  IndianRupee,
  Leaf,
  Home,
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface FormData {
  name: string
  email: string
  location: string
  state: string
  district: string
  pincode: string
  dwellers: string
  roofArea: string
  roofType: string
  openSpace: string
  currentWaterSource: string
  monthlyWaterBill: string
  additionalInfo: string
}

interface AssessmentResults {
  feasibility: "high" | "medium" | "low"
  feasibilityScore: number
  annualRainfall: number
  runoffCapacity: number
  recommendedStructures: string[]
  aquiferInfo: {
    type: string
    depth: string
    quality: string
  }
  costEstimate: {
    initial: number
    annual: number
    paybackPeriod: number
  }
  waterSavings: {
    annual: number
    monthly: number
    percentage: number
  }
  structureDimensions: {
    rechargePit: { length: number; width: number; depth: number }
    storageTank: { capacity: number; dimensions: string }
  }
}

const monthlyRainfallData = [
  { month: "Jan", rainfall: 15 },
  { month: "Feb", rainfall: 20 },
  { month: "Mar", rainfall: 25 },
  { month: "Apr", rainfall: 35 },
  { month: "May", rainfall: 85 },
  { month: "Jun", rainfall: 180 },
  { month: "Jul", rainfall: 220 },
  { month: "Aug", rainfall: 195 },
  { month: "Sep", rainfall: 145 },
  { month: "Oct", rainfall: 75 },
  { month: "Nov", rainfall: 35 },
  { month: "Dec", rainfall: 20 },
]

const waterSourceData = [
  { name: "Rainwater Harvesting", value: 65, color: "#d97706" },
  { name: "Current Source", value: 35, color: "#4b5563" },
]

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData | null>(null)
  const [results, setResults] = useState<AssessmentResults | null>(null)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setFormData(parsedData)

        // Generate assessment results based on form data
        const assessmentResults = generateAssessmentResults(parsedData)
        setResults(assessmentResults)
      } catch (error) {
        console.error("Error parsing form data:", error)
      }
    }
  }, [searchParams])

  const generateAssessmentResults = (data: FormData): AssessmentResults => {
    const roofArea = Number(data.roofArea)
    const openSpace = Number(data.openSpace)
    const monthlyBill = Number(data.monthlyWaterBill)

    // Calculate feasibility based on roof area and open space
    let feasibilityScore = 0
    if (roofArea >= 100) feasibilityScore += 30
    else if (roofArea >= 50) feasibilityScore += 20
    else feasibilityScore += 10

    if (openSpace >= 50) feasibilityScore += 25
    else if (openSpace >= 20) feasibilityScore += 15
    else feasibilityScore += 5

    // Add points for roof type
    if (data.roofType === "concrete") feasibilityScore += 25
    else if (data.roofType === "metal") feasibilityScore += 20
    else feasibilityScore += 15

    // Add points for household size
    if (data.dwellers === "3-4" || data.dwellers === "5-6") feasibilityScore += 20
    else feasibilityScore += 15

    const feasibility = feasibilityScore >= 80 ? "high" : feasibilityScore >= 60 ? "medium" : "low"

    // Calculate runoff capacity (80% efficiency)
    const annualRainfall = 1050 // mm (example for moderate rainfall area)
    const runoffCapacity = Math.round((roofArea * annualRainfall * 0.8) / 1000) // in liters

    // Cost calculations
    const initialCost = Math.round(roofArea * 150 + openSpace * 100 + 25000) // Base cost formula
    const annualSavings = Math.round(monthlyBill * 12 * 0.4) // 40% savings
    const paybackPeriod = Math.round(initialCost / annualSavings)

    return {
      feasibility,
      feasibilityScore,
      annualRainfall,
      runoffCapacity,
      recommendedStructures: [
        "Rooftop Collection System",
        "First Flush Diverter",
        "Storage Tank",
        "Recharge Pit",
        "Filtration System",
      ],
      aquiferInfo: {
        type: "Alluvial Aquifer",
        depth: "15-25 meters",
        quality: "Good to Moderate",
      },
      costEstimate: {
        initial: initialCost,
        annual: annualSavings,
        paybackPeriod,
      },
      waterSavings: {
        annual: runoffCapacity,
        monthly: Math.round(runoffCapacity / 12),
        percentage: 40,
      },
      structureDimensions: {
        rechargePit: {
          length: Math.max(2, Math.round(openSpace / 20)),
          width: Math.max(2, Math.round(openSpace / 20)),
          depth: 3,
        },
        storageTank: {
          capacity: Math.round(runoffCapacity * 0.3),
          dimensions: "3m × 3m × 2m",
        },
      },
    }
  }

  if (!formData || !results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating your assessment results...</p>
        </div>
      </div>
    )
  }

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200"
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "low":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  const getFeasibilityIcon = (feasibility: string) => {
    switch (feasibility) {
      case "high":
        return <CheckCircle className="h-5 w-5" />
      case "medium":
        return <AlertTriangle className="h-5 w-5" />
      case "low":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/assessment">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Assessment
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Assessment Results</h1>
                <p className="text-sm text-muted-foreground">Rainwater harvesting potential for {formData.location}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Feasibility Overview */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Feasibility Assessment</CardTitle>
                  <CardDescription>Overall evaluation of rainwater harvesting potential</CardDescription>
                </div>
                <Badge className={`text-lg px-4 py-2 ${getFeasibilityColor(results.feasibility)}`}>
                  {getFeasibilityIcon(results.feasibility)}
                  <span className="ml-2 capitalize">{results.feasibility} Feasibility</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{results.feasibilityScore}%</div>
                  <div className="text-sm text-muted-foreground">Feasibility Score</div>
                  <Progress value={results.feasibilityScore} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{results.runoffCapacity.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Annual Water Collection (Liters)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{results.waterSavings.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Potential Water Bill Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-primary" />
                      Rainfall Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyRainfallData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="rainfall" fill="#d97706" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-primary">{results.annualRainfall}mm</div>
                      <div className="text-sm text-muted-foreground">Annual Rainfall</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Aquifer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aquifer Type:</span>
                      <span className="font-medium">{results.aquiferInfo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Groundwater Depth:</span>
                      <span className="font-medium">{results.aquiferInfo.depth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Water Quality:</span>
                      <span className="font-medium">{results.aquiferInfo.quality}</span>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Recommended Structures:</h4>
                      <div className="space-y-2">
                        {results.recommendedStructures.map((structure, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{structure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5 text-primary" />
                      Structure Dimensions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Recharge Pit Specifications</h4>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Length:</span>
                          <span className="font-medium">{results.structureDimensions.rechargePit.length}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Width:</span>
                          <span className="font-medium">{results.structureDimensions.rechargePit.width}m</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Depth:</span>
                          <span className="font-medium">{results.structureDimensions.rechargePit.depth}m</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Storage Tank Specifications</h4>
                      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Capacity:</span>
                          <span className="font-medium">
                            {results.structureDimensions.storageTank.capacity.toLocaleString()}L
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dimensions:</span>
                          <span className="font-medium">{results.structureDimensions.storageTank.dimensions}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Water Collection Potential
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={waterSourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {waterSourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {waterSourceData.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-sm">{entry.name}</span>
                          </div>
                          <span className="font-medium">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      Initial Investment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      ₹{results.costEstimate.initial.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Includes materials, installation, and setup costs</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Annual Savings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ₹{results.costEstimate.annual.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Estimated yearly water bill reduction</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Payback Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {results.costEstimate.paybackPeriod} years
                    </div>
                    <p className="text-sm text-muted-foreground">Time to recover initial investment</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                  <CardDescription>Detailed breakdown of implementation costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Rooftop Collection System</span>
                      <span className="font-medium">
                        ₹{Math.round(results.costEstimate.initial * 0.3).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Storage Tank</span>
                      <span className="font-medium">
                        ₹{Math.round(results.costEstimate.initial * 0.25).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Recharge Structures</span>
                      <span className="font-medium">
                        ₹{Math.round(results.costEstimate.initial * 0.2).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Filtration System</span>
                      <span className="font-medium">
                        ₹{Math.round(results.costEstimate.initial * 0.15).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Installation & Labor</span>
                      <span className="font-medium">
                        ₹{Math.round(results.costEstimate.initial * 0.1).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>₹{results.costEstimate.initial.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Environmental Tab */}
            <TabsContent value="environmental" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary" />
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Water Conservation:</span>
                      <span className="font-medium">{results.waterSavings.annual.toLocaleString()}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Average:</span>
                      <span className="font-medium">{results.waterSavings.monthly.toLocaleString()}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Groundwater Recharge:</span>
                      <span className="font-medium">
                        {Math.round(results.runoffCapacity * 0.6).toLocaleString()}L/year
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbon Footprint Reduction:</span>
                      <span className="font-medium">~2.5 tons CO₂/year</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Community Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Reduces strain on municipal water supply</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Helps prevent urban flooding during monsoons</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Improves local groundwater levels</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Creates awareness about water conservation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Supports sustainable development goals</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Implementation Tab */}
            <TabsContent value="implementation" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Implementation Roadmap</CardTitle>
                  <CardDescription>Step-by-step guide to implement your rainwater harvesting system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Site Preparation & Permits</h4>
                        <p className="text-sm text-muted-foreground">
                          Obtain necessary permits, conduct soil testing, and prepare the installation site.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Timeline: 1-2 weeks</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Rooftop Collection System</h4>
                        <p className="text-sm text-muted-foreground">
                          Install gutters, downspouts, and first flush diverters on your rooftop.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Timeline: 2-3 days</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Storage & Filtration</h4>
                        <p className="text-sm text-muted-foreground">
                          Install storage tanks and filtration systems for water treatment.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Timeline: 3-4 days</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Recharge Structures</h4>
                        <p className="text-sm text-muted-foreground">
                          Construct recharge pits, trenches, and connect to groundwater recharge system.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Timeline: 4-5 days</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        5
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Testing & Commissioning</h4>
                        <p className="text-sm text-muted-foreground">
                          Test the complete system, ensure proper functioning, and provide training.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Timeline: 1-2 days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1">Contact Implementation Partner</Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Download Detailed Report
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Schedule Site Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
