"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, MapPin, Users, Home, Calculator } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

const steps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: Users,
  },
  {
    id: 2,
    title: "Location Details",
    description: "Where is your property located?",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Property Information",
    description: "Details about your roof and space",
    icon: Home,
  },
  {
    id: 4,
    title: "Water Usage",
    description: "Current water consumption patterns",
    icon: Calculator,
  },
]

export default function AssessmentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    location: "",
    state: "",
    district: "",
    pincode: "",
    dwellers: "",
    roofArea: "",
    roofType: "",
    openSpace: "",
    currentWaterSource: "",
    monthlyWaterBill: "",
    additionalInfo: "",
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
        break
      case 2:
        if (!formData.location.trim()) newErrors.location = "Location is required"
        if (!formData.state) newErrors.state = "State is required"
        if (!formData.district.trim()) newErrors.district = "District is required"
        if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required"
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Invalid pincode format"
        break
      case 3:
        if (!formData.dwellers) newErrors.dwellers = "Number of dwellers is required"
        if (!formData.roofArea.trim()) newErrors.roofArea = "Roof area is required"
        else if (isNaN(Number(formData.roofArea)) || Number(formData.roofArea) <= 0) {
          newErrors.roofArea = "Please enter a valid roof area"
        }
        if (!formData.roofType) newErrors.roofType = "Roof type is required"
        if (!formData.openSpace.trim()) newErrors.openSpace = "Available open space is required"
        else if (isNaN(Number(formData.openSpace)) || Number(formData.openSpace) < 0) {
          newErrors.openSpace = "Please enter a valid open space area"
        }
        break
      case 4:
        if (!formData.currentWaterSource) newErrors.currentWaterSource = "Current water source is required"
        if (!formData.monthlyWaterBill.trim()) newErrors.monthlyWaterBill = "Monthly water bill is required"
        else if (isNaN(Number(formData.monthlyWaterBill)) || Number(formData.monthlyWaterBill) < 0) {
          newErrors.monthlyWaterBill = "Please enter a valid amount"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      } else {
        // Submit form and navigate to results
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // In a real app, this would send data to an API
    const assessmentData = encodeURIComponent(JSON.stringify(formData))
    router.push(`/results?data=${assessmentData}`)
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Rainwater Harvesting Assessment</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                            ? "border-primary text-primary bg-primary/10"
                            : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                )
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Form Content */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
              <CardDescription className="text-lg">{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="Enter your email address"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Location Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Complete Address *</Label>
                    <Textarea
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateFormData("location", e.target.value)}
                      placeholder="Enter your complete address"
                      className={errors.location ? "border-destructive" : ""}
                      rows={3}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => updateFormData("state", value)}>
                        <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                          <SelectItem value="assam">Assam</SelectItem>
                          <SelectItem value="bihar">Bihar</SelectItem>
                          <SelectItem value="gujarat">Gujarat</SelectItem>
                          <SelectItem value="haryana">Haryana</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                          <SelectItem value="kerala">Kerala</SelectItem>
                          <SelectItem value="madhya-pradesh">Madhya Pradesh</SelectItem>
                          <SelectItem value="maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="punjab">Punjab</SelectItem>
                          <SelectItem value="rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                          <SelectItem value="west-bengal">West Bengal</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => updateFormData("district", e.target.value)}
                        placeholder="Enter district"
                        className={errors.district ? "border-destructive" : ""}
                      />
                      {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => updateFormData("pincode", e.target.value)}
                        placeholder="Enter pincode"
                        className={errors.pincode ? "border-destructive" : ""}
                        maxLength={6}
                      />
                      {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Property Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dwellers">Number of People in Household *</Label>
                      <Select value={formData.dwellers} onValueChange={(value) => updateFormData("dwellers", value)}>
                        <SelectTrigger className={errors.dwellers ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select number of dwellers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 people</SelectItem>
                          <SelectItem value="3-4">3-4 people</SelectItem>
                          <SelectItem value="5-6">5-6 people</SelectItem>
                          <SelectItem value="7-8">7-8 people</SelectItem>
                          <SelectItem value="9+">9+ people</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.dwellers && <p className="text-sm text-destructive">{errors.dwellers}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roofType">Roof Type *</Label>
                      <Select value={formData.roofType} onValueChange={(value) => updateFormData("roofType", value)}>
                        <SelectTrigger className={errors.roofType ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select roof type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete/RCC</SelectItem>
                          <SelectItem value="metal">Metal Sheets</SelectItem>
                          <SelectItem value="tile">Clay Tiles</SelectItem>
                          <SelectItem value="asbestos">Asbestos Sheets</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.roofType && <p className="text-sm text-destructive">{errors.roofType}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="roofArea">Roof Area (sq. meters) *</Label>
                      <Input
                        id="roofArea"
                        type="number"
                        value={formData.roofArea}
                        onChange={(e) => updateFormData("roofArea", e.target.value)}
                        placeholder="Enter roof area in square meters"
                        className={errors.roofArea ? "border-destructive" : ""}
                        min="1"
                      />
                      {errors.roofArea && <p className="text-sm text-destructive">{errors.roofArea}</p>}
                      <p className="text-sm text-muted-foreground">Tip: Measure length × width of your roof area</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openSpace">Available Open Space (sq. meters) *</Label>
                      <Input
                        id="openSpace"
                        type="number"
                        value={formData.openSpace}
                        onChange={(e) => updateFormData("openSpace", e.target.value)}
                        placeholder="Enter available open space"
                        className={errors.openSpace ? "border-destructive" : ""}
                        min="0"
                      />
                      {errors.openSpace && <p className="text-sm text-destructive">{errors.openSpace}</p>}
                      <p className="text-sm text-muted-foreground">Space available for recharge structures</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Water Usage */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentWaterSource">Current Primary Water Source *</Label>
                      <Select
                        value={formData.currentWaterSource}
                        onValueChange={(value) => updateFormData("currentWaterSource", value)}
                      >
                        <SelectTrigger className={errors.currentWaterSource ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select water source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="municipal">Municipal Water Supply</SelectItem>
                          <SelectItem value="borewell">Private Borewell</SelectItem>
                          <SelectItem value="well">Open Well</SelectItem>
                          <SelectItem value="tanker">Water Tanker</SelectItem>
                          <SelectItem value="mixed">Mixed Sources</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.currentWaterSource && (
                        <p className="text-sm text-destructive">{errors.currentWaterSource}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthlyWaterBill">Monthly Water Bill (₹) *</Label>
                      <Input
                        id="monthlyWaterBill"
                        type="number"
                        value={formData.monthlyWaterBill}
                        onChange={(e) => updateFormData("monthlyWaterBill", e.target.value)}
                        placeholder="Enter monthly water bill amount"
                        className={errors.monthlyWaterBill ? "border-destructive" : ""}
                        min="0"
                      />
                      {errors.monthlyWaterBill && <p className="text-sm text-destructive">{errors.monthlyWaterBill}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                      placeholder="Any additional details about your property, water usage, or specific requirements..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      Share any specific challenges or requirements for your rainwater harvesting system
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === steps.length ? "Generate Assessment" : "Next"}
                  {currentStep < steps.length && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
