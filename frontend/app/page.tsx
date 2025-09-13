"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Calculator, MapPin, TrendingUp, Users, Leaf } from "lucide-react"
import Link from "next/link"
import Translator from "@/components/translator/translator"
import { LocationDisplay } from "@/components/location-display"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Droplets className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AquaConserve</h1>
                <p className="text-sm text-muted-foreground">Groundwater Conservation Platform</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/GIS" className="text-foreground hover:text-primary transition-colors">
                GIS
              </Link>
              <Link href="/assessment" className="text-foreground hover:text-primary transition-colors">
                Assessment Tool
              </Link>
              <Link href="/resources" className="text-foreground hover:text-primary transition-colors">
                Resources
              </Link>
              <Link href="/about" className="text-foreground hover:text-primary transition-colors">
                About
              </Link>
            </nav>
            
            <div className="flex items-center">
              <Translator />
            </div>
          </div>
        </div>
      </header>

      {/* Location Display */}
      <section className="py-4 px-4">
        <LocationDisplay />
      </section>
     

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Assess Your Rainwater Harvesting Potential
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Empower your community with data-driven insights for groundwater conservation. Our comprehensive
              assessment tool helps you determine the feasibility and impact of rooftop rainwater harvesting at your
              location.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/assessment">
                  <Calculator className="mr-2 h-5 w-5" />
                  Start Assessment
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/resources">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Comprehensive Assessment Features</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get detailed insights and recommendations tailored to your specific location and requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Location Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Get detailed information about your area's principal aquifer, groundwater depth, and local rainfall
                  patterns for accurate assessment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Feasibility Check</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Determine the viability of rooftop rainwater harvesting based on your roof area, household size, and
                  available space.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Cost-Benefit Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Receive detailed cost estimates and return on investment calculations for your rainwater harvesting
                  system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Droplets className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Runoff Capacity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Calculate your roof's water collection potential and recommended storage capacity based on local
                  rainfall data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Leaf className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Structure Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Get specific recommendations for recharge pits, trenches, and shafts with detailed dimensions and
                  specifications.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Community Impact</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Understand how your conservation efforts contribute to broader community water security and
                  environmental sustainability.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Making a Difference Together</h3>
            <p className="text-lg text-muted-foreground">
              Join thousands of users contributing to groundwater conservation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-lg text-muted-foreground">Assessments Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2.5M</div>
              <div className="text-lg text-muted-foreground">Liters Water Conserved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-lg text-muted-foreground">Communities Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-primary-foreground mb-4 text-balance">
              Ready to Start Your Conservation Journey?
            </h3>
            <p className="text-lg text-primary-foreground/90 mb-8 text-pretty leading-relaxed">
              Take the first step towards sustainable water management. Our assessment takes just 5 minutes and provides
              actionable insights.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/assessment">Begin Assessment Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Droplets className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">AquaConserve</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering communities through data-driven groundwater conservation solutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/assessment" className="hover:text-primary transition-colors">
                    Assessment Tool
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="hover:text-primary transition-colors">
                    Cost Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/map" className="hover:text-primary transition-colors">
                    Location Map
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/guides" className="hover:text-primary transition-colors">
                    Implementation Guides
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-primary transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/research" className="hover:text-primary transition-colors">
                    Research Papers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-primary transition-colors">
                    Community Forum
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AquaConserve. Developed in partnership with Central Ground Water Board (CGWB).
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
