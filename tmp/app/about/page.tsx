import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Target, Award, Globe } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
              <h1 className="text-xl font-bold text-foreground">About AquaConserve</h1>
              <p className="text-sm text-muted-foreground">Empowering communities through groundwater conservation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Bridging Science and Community Action
            </h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              AquaConserve is a digital platform developed to democratize access to groundwater conservation knowledge
              and empower individuals to make informed decisions about rainwater harvesting.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To promote public participation in groundwater conservation by providing accessible, scientific tools
                  that enable individuals and communities to assess their rainwater harvesting potential and implement
                  sustainable water management practices.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  A water-secure future where every household and community actively participates in groundwater
                  conservation, supported by data-driven insights and sustainable practices that ensure water
                  availability for generations to come.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Partnership with CGWB */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Partnership with Central Ground Water Board (CGWB)
              </CardTitle>
              <CardDescription>
                Developed in collaboration with India's premier groundwater management authority
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This platform is built upon decades of scientific research and field expertise from the Central Ground
                Water Board (CGWB), Ministry of Jal Shakti, Government of India. CGWB has been at the forefront of
                groundwater assessment, management, and regulation since 1970.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">CGWB's Contributions:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Scientific manuals on rainwater harvesting</li>
                    <li>• Groundwater assessment methodologies</li>
                    <li>• Aquifer mapping and characterization</li>
                    <li>• Artificial recharge guidelines</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Platform Benefits:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• GIS-based location analysis</li>
                    <li>• Algorithmic feasibility assessment</li>
                    <li>• Personalized recommendations</li>
                    <li>• Cost-benefit calculations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>How AquaConserve Works</CardTitle>
              <CardDescription>A user-friendly approach to complex groundwater science</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-medium">Simple Input</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter basic details about your location, roof area, and household size
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-medium">Scientific Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Our algorithms process your data using CGWB's scientific models
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-medium">Actionable Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed recommendations and implementation guidance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Statistics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Our Impact
              </CardTitle>
              <CardDescription>Making a difference in water conservation across India</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">50,000+</div>
                  <div className="text-sm text-muted-foreground">Assessments Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">1,200+</div>
                  <div className="text-sm text-muted-foreground">Communities Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">2.5M</div>
                  <div className="text-sm text-muted-foreground">Liters Conserved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">28</div>
                  <div className="text-sm text-muted-foreground">States Covered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Ready to Start Your Conservation Journey?</h3>
            <p className="text-muted-foreground">
              Join thousands of users who are making a difference in groundwater conservation.
            </p>
            <Button size="lg" asChild>
              <Link href="/assessment">Start Your Assessment</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
