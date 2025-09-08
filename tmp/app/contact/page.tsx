import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Bug } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
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
              <h1 className="text-xl font-bold text-foreground">Contact & Support</h1>
              <p className="text-sm text-muted-foreground">Get help and connect with our team</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">We're Here to Help</h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              Have questions about rainwater harvesting or need technical support? Our team of experts is ready to
              assist you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>Multiple ways to reach our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-muted-foreground">support@aquaconserve.gov.in</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-muted-foreground">1800-123-4567 (Toll Free)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Office Address</div>
                      <div className="text-sm text-muted-foreground">
                        Central Ground Water Board
                        <br />
                        Ministry of Jal Shakti
                        <br />
                        New Delhi - 110066
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Support Hours</div>
                      <div className="text-sm text-muted-foreground">
                        Mon-Fri: 9:00 AM - 6:00 PM IST
                        <br />
                        Sat: 9:00 AM - 1:00 PM IST
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Support Categories</CardTitle>
                  <CardDescription>Choose the right support channel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">General Questions & Guidance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">Technical Implementation Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bug className="h-4 w-4 text-primary" />
                    <span className="text-sm">Platform Issues & Bug Reports</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" placeholder="Enter your first name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" placeholder="Enter your last name" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="Enter your email address" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Enter your phone number" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Support Category *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Questions</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="implementation">Implementation Guidance</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="City, State" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" placeholder="Brief description of your inquiry" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide detailed information about your question or issue..."
                        rows={6}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button type="submit" className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button type="button" variant="outline" className="flex-1 bg-transparent">
                        Clear Form
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Regional Offices */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Regional Offices</CardTitle>
              <CardDescription>Connect with CGWB regional offices for localized support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Northern Region</h4>
                  <p className="text-sm text-muted-foreground">
                    Chandigarh
                    <br />
                    Phone: 0172-2749408
                    <br />
                    Email: nr-cgwb@gov.in
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Western Region</h4>
                  <p className="text-sm text-muted-foreground">
                    Ahmedabad
                    <br />
                    Phone: 079-23251502
                    <br />
                    Email: wr-cgwb@gov.in
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Eastern Region</h4>
                  <p className="text-sm text-muted-foreground">
                    Kolkata
                    <br />
                    Phone: 033-23357780
                    <br />
                    Email: er-cgwb@gov.in
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Southern Region</h4>
                  <p className="text-sm text-muted-foreground">
                    Hyderabad
                    <br />
                    Phone: 040-24651553
                    <br />
                    Email: sr-cgwb@gov.in
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-border bg-muted/30">
            <CardHeader>
              <CardTitle>Emergency Water Crisis Support</CardTitle>
              <CardDescription>For urgent water-related emergencies and crisis situations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">24/7 Emergency Helpline</div>
                  <div className="text-sm text-muted-foreground">
                    For critical water shortage situations and emergency technical support
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">1800-180-1551</div>
                  <div className="text-sm text-muted-foreground">Toll Free</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
