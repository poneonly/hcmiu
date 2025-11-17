"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getGrades, predictGpa, analyzeGrades } from "@/lib/grades"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GradesSkeleton } from "@/components/skeletons"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface GradeRecord {
  id: string
  courseCode: string
  courseName: string
  credits: number
  grade: string
  gpa: number
}

export default function GradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [predictor, setPredictor] = useState({
    currentGpa: 3.75,
    totalCredits: 18,
    targetGpa: 3.9,
  })
  const [prediction, setPrediction] = useState("")
  const [predictorLoading, setPredictorLoading] = useState(false)
  const [rawData, setRawData] = useState("")
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await getGrades()
        setGrades(data)
      } catch (error) {
        console.error("Failed to fetch grades:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  const handlePredict = async () => {
    setPredictorLoading(true)
    try {
      const result = await predictGpa(predictor)
      setPrediction(result)
    } catch (error) {
      console.error("Failed to predict:", error)
    } finally {
      setPredictorLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      await analyzeGrades(rawData)
      alert("Analysis complete! (Mock)")
    } catch (error) {
      console.error("Failed to analyze:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  const getGradeColor = (grade: string) => {
    if (["A", "A+"].includes(grade)) return "bg-green-100 text-green-800"
    if (["A-", "B+"].includes(grade)) return "bg-blue-100 text-blue-800"
    if (["B"].includes(grade)) return "bg-yellow-100 text-yellow-800"
    return "bg-orange-100 text-orange-800"
  }

  const getGpaChartData = () => {
    return grades.map((g) => ({
      name: g.courseCode,
      gpa: g.gpa,
      credits: g.credits,
    }))
  }

  const getGradeDistribution = () => {
    const dist: Record<string, number> = {}
    grades.forEach((g) => {
      dist[g.grade] = (dist[g.grade] || 0) + 1
    })
    return Object.entries(dist).map(([name, value]) => ({
      name,
      value,
    }))
  }

  const getCreditsByGrade = () => {
    const creditMap: Record<string, number> = {}
    grades.forEach((g) => {
      creditMap[g.grade] = (creditMap[g.grade] || 0) + g.credits
    })
    return Object.entries(creditMap).map(([grade, credits]) => ({
      grade,
      credits,
    }))
  }

  const chartColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <GradesSkeleton />
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Grades</h1>
          <p className="text-muted-foreground mt-2">View and analyze your academic performance</p>
        </div>

        <Tabs defaultValue="grades" className="mt-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="grades">All Grades</TabsTrigger>
            <TabsTrigger value="predictor">Predictor</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* All Grades Tab */}
          <TabsContent value="grades" className="mt-6 space-y-6">
            {/* Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle>Course Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-2 font-medium">Course Code</th>
                        <th className="text-left py-2 font-medium">Course Name</th>
                        <th className="text-left py-2 font-medium">Credits</th>
                        <th className="text-left py-2 font-medium">Grade</th>
                        <th className="text-left py-2 font-medium">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 font-medium">{grade.courseCode}</td>
                          <td className="py-3">{grade.courseName}</td>
                          <td className="py-3">{grade.credits}</td>
                          <td className="py-3">
                            <Badge className={getGradeColor(grade.grade)}>{grade.grade}</Badge>
                          </td>
                          <td className="py-3 font-medium">{grade.gpa.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GPA by Course */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">GPA by Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      gpa: {
                        label: "GPA",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getGpaChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="gpa" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Count",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-64"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getGradeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getGradeDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Credits by Grade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credits Earned by Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    credits: {
                      label: "Credits",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getCreditsByGrade()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="grade" stroke="var(--color-muted-foreground)" />
                      <YAxis stroke="var(--color-muted-foreground)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="credits"
                        stroke="var(--color-chart-3)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-chart-3)", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GPA Predictor Tab */}
          <TabsContent value="predictor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>GPA Predictor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground">Current GPA</label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={predictor.currentGpa}
                      onChange={(e) => setPredictor({ ...predictor, currentGpa: Number.parseFloat(e.target.value) })}
                      placeholder="3.75"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Total Credits Passed</label>
                    <Input
                      type="number"
                      min="0"
                      value={predictor.totalCredits}
                      onChange={(e) => setPredictor({ ...predictor, totalCredits: Number.parseInt(e.target.value) })}
                      placeholder="18"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Target GPA</label>
                    <Input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      value={predictor.targetGpa}
                      onChange={(e) => setPredictor({ ...predictor, targetGpa: Number.parseFloat(e.target.value) })}
                      placeholder="3.9"
                    />
                  </div>
                  <Button onClick={handlePredict} disabled={predictorLoading} className="w-full">
                    {predictorLoading ? "Calculating..." : "Calculate"}
                  </Button>
                  {prediction && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-foreground">{prediction}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Analysis Tab */}
          <TabsContent value="analysis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-sm font-medium text-foreground">Paste Data</label>
                    <Textarea
                      placeholder="StudentID, Grade"
                      value={rawData}
                      onChange={(e) => setRawData(e.target.value)}
                      className="h-32"
                    />
                  </div>
                  <Button onClick={handleAnalyze} disabled={analyzing || !rawData} className="w-full">
                    {analyzing ? "Analyzing..." : "Generate Graph"}
                  </Button>
                  <div className="p-4 bg-muted rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground">Chart placeholder</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}
