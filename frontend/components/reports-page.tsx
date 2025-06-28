"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Clock, Target, Activity, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartWrapper, RechartsComponents } from "@/components/ui/chart-wrapper"
import { fetchPomodoroSessions, PomodoroSession } from "@/utils/pomodoro-api"
import { apiRequest } from "@/lib/auth"
import { API_BASE } from '@/lib/auth'

export function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">("weekly")

  // 1. Load user projects and time entries from backend (persistent)
  const [projects, setProjects] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCompletedProjects, setLoadingCompletedProjects] = useState(true)
  const [completedProjects, setCompletedProjects] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [projectsRes, timeEntriesRes, pomodoroRes] = await Promise.all([
          apiRequest(`${API_BASE}/projects/`),
          apiRequest(`${API_BASE}/time-entries/`),
          fetchPomodoroSessions()
        ])

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData)
        }

        if (timeEntriesRes.ok) {
          const timeEntriesData = await timeEntriesRes.json()
          setTimeEntries(timeEntriesData)
        }

        if (pomodoroRes.ok) {
          const pomodoroData = await pomodoroRes.json()
          setPomodoroSessions(pomodoroData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 2. Group time entries by period
  function groupEntries(entries: any[], period: "daily" | "weekly" | "monthly") {
    const grouped: { [key: string]: number } = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.start_time)
      let key = ""
      
      if (period === "daily") {
        key = date.toLocaleDateString()
      } else if (period === "weekly") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = `Week of ${weekStart.toLocaleDateString()}`
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }
      
      const hours = (new Date(entry.end_time).getTime() - date.getTime()) / (1000 * 60 * 60)
      grouped[key] = (grouped[key] || 0) + hours
    })
    
    return Object.entries(grouped).map(([key, hours]) => ({
      [period === "monthly" ? "week" : "day"]: key,
      hours: parseFloat(hours.toFixed(1))
    }))
  }

  // 3. Group pomodoro entries by period
  function groupPomodoroEntries(entries: PomodoroSession[], period: "daily" | "weekly" | "monthly") {
    const grouped: { [key: string]: number } = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.start_time)
      let key = ""
      
      if (period === "daily") {
        key = date.toLocaleDateString()
      } else if (period === "weekly") {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = `Week of ${weekStart.toLocaleDateString()}`
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }
      
      grouped[key] = (grouped[key] || 0) + 1
    })
    
    return Object.entries(grouped).map(([key, pomodoros]) => ({
      [period === "monthly" ? "week" : "day"]: key,
      pomodoros
    }))
  }

  // 4. Calculate project time distribution
  const projectTimeMap = new Map<string, number>()
  timeEntries.forEach(entry => {
    const project = projects.find(p => p.id === entry.project)
    if (project) {
      const hours = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60)
      projectTimeMap.set(project.name, (projectTimeMap.get(project.name) || 0) + hours)
    }
  })

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981']
  const projectData = Array.from(projectTimeMap.entries()).map(([name, hours], index) => ({
    name,
    hours: parseFloat(hours.toFixed(1)),
    color: colors[index % colors.length]
  }))

  // 5. Load completed projects count
  useEffect(() => {
    async function loadCompletedProjects() {
      try {
        setLoadingCompletedProjects(true)
        const completedCount = projects.filter(p => p.status?.toLowerCase() === "completed").length
        setCompletedProjects(completedCount)
      } catch (error) {
        console.error("Error loading completed projects:", error)
      } finally {
        setLoadingCompletedProjects(false)
      }
    }

    if (projects.length > 0) {
      loadCompletedProjects()
    }
  }, [projects])

  // 6. Calculate productivity trends
  function getPomodoroTrends(entries: PomodoroSession[], period: "daily" | "weekly" | "monthly") {
    const grouped = groupPomodoroEntries(entries, period)
    
    return grouped.map((item, index) => {
      const efficiency = Math.min(100, (item.pomodoros / 8) * 100) // Assuming 8 pomodoros = 100% efficiency
      const focus = Math.min(100, (item.pomodoros / 4) * 100) // Assuming 4 pomodoros = 100% focus
      const completion = Math.min(100, (item.pomodoros / 6) * 100) // Assuming 6 pomodoros = 100% completion
      
      return {
        [period === "monthly" ? "week" : timePeriod === "weekly" ? "week" : "key"]: item[period === "monthly" ? "week" : "day"],
        efficiency: Math.round(efficiency),
        focus: Math.round(focus),
        completion: Math.round(completion)
      }
    })
  }

  // 7. Calculate task completion data
  function getTaskCompletionData(
    timeEntries: any[],
    completedProjects: any[],
    period: "daily" | "weekly" | "monthly"
  ) {
    const groupedEntries = groupEntries(timeEntries, period)
    const completedCount = completedProjects.length
    
    return groupedEntries.map((entry, index) => ({
      key: entry[period === "monthly" ? "week" : "day"],
      tasks: Math.round(completedCount / Math.max(1, groupedEntries.length)),
      hours: entry.hours
    }))
  }

  // 8. Calculate metrics
  const currentData = groupEntries(timeEntries, timePeriod)
  const pomodoroChartData = groupPomodoroEntries(pomodoroSessions, timePeriod)
  const pomodoroTrendsData = getPomodoroTrends(pomodoroSessions, timePeriod)
  
  const totalHours = timeEntries.reduce((total, entry) => {
    const hours = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60)
    return total + hours
  }, 0)
  
  const totalPomodoros = pomodoroSessions.length
  const avgFocus = totalPomodoros > 0 ? Math.round((totalHours / totalPomodoros) * 60) : 0

  const completedProjectsList = projects.filter(p => p.status?.toLowerCase() === "completed")
  const taskCompletionData = getTaskCompletionData(timeEntries, completedProjectsList, timePeriod)

  return (
    <>
      {/* Centered Header and Controls */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4 flex flex-col items-center text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600">Track your productivity and analyze your work patterns</p>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <span className="text-gray-700 font-medium">View by:</span>
          {['daily', 'weekly', 'monthly'].map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod(period as 'daily' | 'weekly' | 'monthly')}
              className={
                timePeriod === period
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'text-purple-600 border-purple-600 hover:bg-purple-50'
              }
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-full mx-auto space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pomodoros</CardTitle>
                <Timer className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalPomodoros}</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loadingCompletedProjects ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    completedProjects
                  )}
                </div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Focus Time</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{avgFocus}m</div>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Time Tracking Chart */}
            <ChartWrapper
              title="Time Tracking Overview"
              description={`Hours worked per ${timePeriod === "monthly" ? "week" : "day"}`}
              data={currentData}
              noDataMessage="No time tracking data available"
            >
              <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                <RechartsComponents.AreaChart data={currentData}>
                  <RechartsComponents.CartesianGrid strokeDasharray="3 3" />
                  <RechartsComponents.XAxis dataKey={timePeriod === "monthly" ? "week" : "day"} />
                  <RechartsComponents.YAxis />
                  <RechartsComponents.Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-gray-600">{payload[0].value}h</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <RechartsComponents.Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RechartsComponents.AreaChart>
              </RechartsComponents.ResponsiveContainer>
            </ChartWrapper>

            {/* Pomodoro Sessions Chart */}
            <ChartWrapper
              title="Pomodoro Sessions"
              description="Number of completed pomodoro sessions"
              data={pomodoroChartData}
              noDataMessage="No Pomodoro sessions available"
            >
              <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                <RechartsComponents.BarChart data={pomodoroChartData}>
                  <RechartsComponents.CartesianGrid strokeDasharray="3 3" />
                  <RechartsComponents.XAxis dataKey={timePeriod === "monthly" ? "week" : "day"} />
                  <RechartsComponents.YAxis />
                  <RechartsComponents.Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-gray-600">{payload[0].value} sessions</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <RechartsComponents.Bar dataKey="pomodoros" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </RechartsComponents.BarChart>
              </RechartsComponents.ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Project Time Distribution */}
            <ChartWrapper
              title="Time by Project"
              description="Hours spent on different projects"
              data={projectData}
              noDataMessage="No project data available"
            >
              <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                <RechartsComponents.PieChart>
                  <RechartsComponents.Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="hours"
                  >
                    {projectData.map((entry, index) => (
                      <RechartsComponents.Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsComponents.Pie>
                  <RechartsComponents.Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-gray-600">{data.hours}h</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </RechartsComponents.PieChart>
              </RechartsComponents.ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {projectData.map((project, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                      <span>{project.name}</span>
                    </div>
                    <span className="font-medium">{project.hours}h</span>
                  </div>
                ))}
              </div>
            </ChartWrapper>

            {/* Productivity Trends */}
            <ChartWrapper
              title="Productivity Trends"
              description="Efficiency, focus, and completion rates over time"
              data={pomodoroTrendsData}
              noDataMessage="No productivity data available"
            >
              <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                <RechartsComponents.LineChart data={pomodoroTrendsData}>
                  <RechartsComponents.CartesianGrid strokeDasharray="3 3" />
                  <RechartsComponents.XAxis dataKey={timePeriod === "monthly" ? "week" : timePeriod === "weekly" ? "week" : "key"} />
                  <RechartsComponents.YAxis domain={[0, 100]} />
                  <RechartsComponents.Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            {payload.map((item, index) => (
                              <p key={index} className="text-sm text-gray-600" style={{ color: item.color }}>
                                {item.name}: {item.value}
                              </p>
                            ))}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <RechartsComponents.Line type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }} />
                  <RechartsComponents.Line type="monotone" dataKey="focus" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }} />
                  <RechartsComponents.Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }} />
                </RechartsComponents.LineChart>
              </RechartsComponents.ResponsiveContainer>
            </ChartWrapper>
          </div>

          {/* Task Completion Chart */}
          <ChartWrapper
            title="Task Completion Analysis"
            description="Tasks completed vs hours worked correlation"
            data={taskCompletionData}
            noDataMessage="No task completion data available"
          >
            <RechartsComponents.ResponsiveContainer width="100%" height="100%">
              <RechartsComponents.BarChart 
                data={taskCompletionData} 
                barCategoryGap={taskCompletionData.length > 1 ? "20%" : "50%"}
              >
                <RechartsComponents.CartesianGrid strokeDasharray="3 3" />
                <RechartsComponents.XAxis 
                  dataKey="key" 
                  label={{ value: "Period", position: "insideBottom", offset: -5 }} 
                />
                <RechartsComponents.YAxis 
                  yAxisId="left" 
                  label={{ value: "Projects Completed", angle: -90, position: "insideLeft" }} 
                />
                <RechartsComponents.YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ value: "Hours Worked", angle: 90, position: "insideRight" }} 
                />
                <RechartsComponents.Tooltip 
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const tasksPayload = payload.find(p => p.dataKey === 'tasks');
                      const hoursPayload = payload.find(p => p.dataKey === 'hours');
                      return (
                        <div className="bg-background p-2 border rounded-md shadow-lg text-sm">
                          <p className="font-bold mb-1">{`Period: ${label}`}</p>
                          {tasksPayload && <p style={{ color: tasksPayload.fill }}>{`Projects: ${tasksPayload.value}`}</p>}
                          {hoursPayload && <p style={{ color: hoursPayload.fill }}>{`Hours: ${(typeof hoursPayload.value === 'number' ? hoursPayload.value : 0).toFixed(1)}`}</p>}
                        </div>
                      )
                    }
                    return null
                  }} 
                />
                <RechartsComponents.Legend />
                <RechartsComponents.Bar yAxisId="left" dataKey="tasks" fill="#00BCD4" name="Projects Completed" radius={[4, 4, 0, 0]} barSize={60} />
                <RechartsComponents.Line yAxisId="right" type="monotone" dataKey="hours" stroke="#8884d8" name="Hours Worked" strokeWidth={2} />
              </RechartsComponents.BarChart>
            </RechartsComponents.ResponsiveContainer>
          </ChartWrapper>
        </div>
      </div>
    </>
  )
}
