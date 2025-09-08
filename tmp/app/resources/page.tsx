import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Download, ExternalLink, Video, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"

const resources = [
  {
    category: "Implementation Guides",
    items: [
      {
        title: "Rooftop Rainwater Harvesting Manual",
        description: "Comprehensive guide for designing and implementing rooftop rainwater harvesting systems",
        type: "PDF",
        size: "2.5 MB",
        icon: FileText,
      },
      {
        title: "Artificial Recharge Structures Guide",
        description: "Technical specifications for recharge pits, trenches, and injection wells",
        type: "PDF",
        size: "1.8 MB",
        icon: FileText,
      },
      {
        title: "Cost Estimation Handbook",
        description: "Detailed cost analysis and budgeting guide for rainwater harvesting projects",
        type: "PDF",
        size: "1.2 MB",
        icon: FileText,
      },
    ],
  },
  {
    category: "Video Tutorials",
    items: [
      {
        title: "Rainwater Harvesting Basics",
        description: "Introduction to rainwater harvesting principles and benefits",
        type: "Video",
        duration: "12 min",
        icon: Video,
      },
      {
        title: "Site Assessment Techniques",
        description: "How to evaluate your property for rainwater harvesting potential",
        type: "Video",
        duration: "18 min",
        icon: Video,
      },
      {
        title: "Maintenance Best Practices",
        description: "Keeping your rainwater harvesting system in optimal condition",
        type: "Video",
        duration: "15 min",
        icon: Video,
      },
    ],
  },
  {
    category: "Research & Reports",
    items: [
      {
        title: "Groundwater Status Report 2024",
        description: "Latest assessment of groundwater levels and quality across India",
        type: "PDF",
        size: "5.2 MB",
        icon: FileText,
      },
      {
        title: "Climate Impact on Water Resources",
        description: "Research on climate change effects on groundwater and rainfall patterns",
        type: "PDF",
        size: "3.1 MB",
        icon: FileText,
      },
      {
        title: "Success Stories Compilation",
        description: "Case studies of successful rainwater harvesting implementations",
        type: "PDF",
        size: "2.8 MB",
        icon: FileText,
      },
    ],
  },
]

const faqs = [
  {
    question: "What is the minimum roof area required for rainwater harvesting?",
    answer:
      "While there's no strict minimum, a roof area of at least 30 square meters is recommended for meaningful water collection. However, even smaller roofs can contribute to groundwater recharge through proper recharge structures.",
  },
  {
    question: "How much does it cost to implement a rainwater harvesting system?",
    answer:
      "Costs vary based on roof area, storage capacity, and local conditions. Typically, a basic system for a 100 sq.m roof costs between ₹50,000 to ₹1,50,000, with payback periods of 3-7 years depending on water costs in your area.",
  },
  {
    question: "Is rainwater safe for drinking?",
    answer:
      "Rainwater can be made safe for drinking with proper filtration and treatment. However, it's commonly used for non-potable purposes like gardening, toilet flushing, and groundwater recharge. For drinking purposes, additional purification systems are recommended.",
  },
  {
    question: "What maintenance is required for rainwater harvesting systems?",
    answer:
      "Regular maintenance includes cleaning gutters and filters, checking for leaks, removing debris from storage tanks, and ensuring proper functioning of first flush diverters. Most systems require monthly inspections and annual deep cleaning.",
  },
  {
    question: "Can I implement rainwater harvesting in an apartment building?",
    answer:
      "Yes, apartment buildings are excellent candidates for rainwater harvesting due to large roof areas. Community-based systems can be more cost-effective and provide greater water collection capacity. Building association approval and coordination are typically required.",
  },
]

export default function ResourcesPage() {
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
              <h1 className="text-xl font-bold text-foreground">Resources & Guides</h1>
              <p className="text-sm text-muted-foreground">Educational materials and implementation guides</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Knowledge Hub for Water Conservation
            </h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              Access comprehensive guides, research reports, and educational materials to support your rainwater
              harvesting journey.
            </p>
          </div>

          {/* Resource Categories */}
          {resources.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">{category.category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, itemIndex) => {
                  const IconComponent = item.icon
                  return (
                    <Card key={itemIndex} className="border-border hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{item.size || item.duration}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="leading-relaxed mb-4">{item.description}</CardDescription>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}

          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h3>
              <p className="text-muted-foreground">
                Common questions about rainwater harvesting and groundwater conservation
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-3 text-lg">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed pl-8">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <Card className="border-border bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Need More Information?
              </CardTitle>
              <CardDescription>Access additional resources and get personalized guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                  <div className="text-left">
                    <div className="font-medium">CGWB Official Website</div>
                    <div className="text-sm text-muted-foreground">
                      Visit the Central Ground Water Board for official guidelines
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4 bg-transparent">
                  <div className="text-left">
                    <div className="font-medium">Technical Support</div>
                    <div className="text-sm text-muted-foreground">
                      Get help with implementation and technical queries
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Ready to Get Started?</h3>
            <p className="text-muted-foreground">
              Use our assessment tool to evaluate your rainwater harvesting potential.
            </p>
            <Button size="lg" asChild>
              <Link href="/assessment">Start Assessment</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
