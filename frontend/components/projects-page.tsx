"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  User,
  Building,
  FileText,
  Eye,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle,
  RotateCcw,
  FolderOpen,
  Users,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedProjectModal } from "./enhanced-project-modal"
import { Project } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import { fetchProjects, createProject, updateProject } from "@/utils/projects-api"
import { apiRequest } from "@/lib/auth"
import React from "react"
import { Client } from "@/types"
import { API_BASE } from '@/lib/auth'

// Add this function for backend delete
async function deleteProjectFromBackend(projectId: number) {
  const res = await apiRequest(
    `${API_BASE}/projects/${projectId}/`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete project in backend");
}

// Add this function for backend create
async function createProjectInBackend(projectData: any) {
  try {
    // Create project with proper field names
    const projectPayload = {
      name: projectData.name,
      status: projectData.status || "Planning",
      progress: projectData.progress || 0,
      client_name: projectData.client || "",
    };

    const response = await apiRequest(`${API_BASE}/projects/`, {
      method: "POST",
      body: JSON.stringify(projectPayload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to create project in backend");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Project creation error:", error);
    throw error;
  }
}

export function ProjectsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  interface Filters {
  client: string;
  billable: string;
  template: string;
}

const [filters, setFilters] = useState<Filters>({
  client: "",
  billable: "",
  template: "",
})

  // State to store user-created projects
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([]) // State for client objects
  const [showTaskCreation, setShowTaskCreation] = useState(false)
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<string>("")

  // New states for API integration
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectClient, setNewProjectClient] = useState("")

  // Dynamic data based on created projects
  const clientNames = ["All Clients", ...clients.map((c) => c.name)];
  
  const billableOptions = ["All", "Billable", "Non-Billable"];
  const templates = [
    "All Templates",
    "Web Development",
    "Mobile App",
    "Design",
    "Internal Project",
    "Consulting",
    "Marketing",
    "Research",
    ...Array.from(
      new Set(
        projects
          .map((p) => p.template)
          .filter(
            (t) =>
              t &&
              ![
                "Web Development",
                "Mobile App",
                "Design",
                "Internal Project",
                "Consulting",
                "Marketing",
                "Research",
              ].includes(t)
          )
      )
    ).filter((t) => t && t !== ""),
  ];

  useEffect(() => {
    const selectedProject = localStorage.getItem("selectedProject")
    if (selectedProject) {
      setSelectedProjectForTasks(selectedProject)
      setShowTaskCreation(true)
      localStorage.removeItem("selectedProject")
    }
  }, [])

  // Fetch projects from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const projectsData = await fetchProjects();
        const clientsData = await apiRequest(`${API_BASE}/projects/clients/`).then(res => res.json());

        if (Array.isArray(projectsData)) {
          // Normalize projects data
          const normalizedProjects = projectsData.map((p: any) => ({
            ...p,
            client: p.client?.name ?? p.client ?? "", // Flatten client object to name
            createdDate: p.createdDate ?? new Date().toISOString().split("T")[0],
          }));
          setProjects(normalizedProjects)
        } else {
          setProjects([])
        }
        
        if(Array.isArray(clientsData)) {
            setClients(clientsData);
        } else {
            setClients([]);
        }

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, []) // Remove loading from dependency array to prevent re-fetch loops

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
      const backendProject = await createProjectInBackend({
        name: newProjectName,
        client: newProjectClient,
        status: "Planning",
        progress: 0,
      })
      setNewProjectName("")
      setNewProjectClient("")
      setLoading(true) // trigger refetch from backend
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "On Hold":
        return "bg-orange-100 text-orange-800"
      case "Review":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return CheckCircle
      case "In Progress":
        return Play
      case "Planning":
        return FileText
      case "On Hold":
        return Pause
      case "Review":
        return RotateCcw
      default:
        return FileText
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      Planning: "In Progress",
      "In Progress": "Review",
      Review: "Completed",
      "On Hold": "In Progress",
      Completed: "Planning", // Allow restarting if needed
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || "In Progress"
  }

  const getStatusProgress = (status: string) => {
    const progressMap = {
      Planning: 0,
      "In Progress": 50,
      Review: 85,
      "On Hold": 25,
      Completed: 100,
    }
    return progressMap[status as keyof typeof progressMap] || 0
  }

  const isDeadlineOverdue = (deadline: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadlineDate.setHours(0, 0, 0, 0)
    return deadlineDate < today
  }

  const isDeadlineNear = (deadline: string) => {
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  const filteredProjects = projects.filter((project) => {
    const searchTermMatch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof project.client === 'string' && project.client.toLowerCase().includes(searchTerm.toLowerCase()))

    const clientFilterMatch =
      filters.client === "" || filters.client === "All Clients" || (typeof project.client === 'string' && project.client === filters.client)

    const billableFilterMatch =
      filters.billable === "" ||
      filters.billable === "All" ||
      (filters.billable === "Billable" && project.isBillable) ||
      (filters.billable === "Non-Billable" && !project.isBillable)

    const templateFilterMatch =
      filters.template === "" || filters.template === "All Templates" || project.template === filters.template

    return searchTermMatch && clientFilterMatch && billableFilterMatch && templateFilterMatch
  })

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setShowAddModal(true)
  }

  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>({})

  const handleStatusChange = async (projectId: number, newStatus: string) => {
    setStatusLoading(prev => ({ ...prev, [projectId]: true }))
    try {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        // Optimistic UI update
        const updatedProjects = projects.map(p => 
          p.id === projectId ? { ...p, status: newStatus } : p
        )
        setProjects(updatedProjects)
        
        await updateProject(projectId, { status: newStatus })
      }
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`)
      // Revert UI on failure if needed
    } finally {
      setStatusLoading(prev => ({ ...prev, [projectId]: false }))
    }
  }

  const handleSaveProject = async (projectData: any) => {
    setLoading(true)
    setError(null)
    try {
      if (projectData.id) {
        // Update existing project
        // Find the original project to get the client object if it exists
        const originalProject = projects.find(p => p.id === projectData.id)
        if (originalProject) {
          projectData.client = originalProject.client
        }
        await updateProject(projectData.id, projectData)
      } else {
        await createProjectInBackend(projectData)
      }
      setShowAddModal(false)
      setSelectedProject(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false) // This will trigger the useEffect to refetch all projects
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    setLoading(true);
    try {
      await deleteProjectFromBackend(projectId);
      // Wait for backend to process, then trigger a refetch by toggling loading state
      fetchProjects()
        .then((data) => {
          if (Array.isArray(data)) {
            setProjects(
              data.map((p) => ({
                ...p,
                
                recentActivity: Array.isArray(p.recentActivity) ? p.recentActivity : [],
                name: p.name ?? "",
                client: p.client ?? "",
                description: p.description ?? "",
                status: p.status ?? "Planning",
                progress: typeof p.progress === "number" ? p.progress : 0,
                billableRate: typeof p.billableRate === "number" ? p.billableRate : 0,
                totalHours: typeof p.totalHours === "number" ? p.totalHours : 0,
                billableHours: typeof p.billableHours === "number" ? p.billableHours : 0,
                totalCost: typeof p.totalCost === "number" ? p.totalCost : 0,
                template: p.template ?? "",
                createdDate: p.createdDate ?? new Date().toISOString().split("T")[0],
                deadline: p.deadline ?? "",
                isBillable: typeof p.isBillable === "boolean" ? p.isBillable : false,
              }))
            );
          } else {
            setProjects([]);
          }
        })
        .catch(() => setProjects([]));
    } catch (err) {
      setError("Failed to delete project.");
    } finally {
      setLoading(false);
    }
  }

  const renderTaskCreationInterface = () => {
    if (projects.length === 0 && showTaskCreation) {
      return (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create Tasks</CardTitle>
            <CardDescription>You can create tasks even without setting up projects first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Enter task name" className="w-full" autocomplete="off" />
              <Textarea placeholder="Task description" className="w-full" />
              <div className="flex space-x-2">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Create Task</Button>
                <Button variant="outline" onClick={() => setShowTaskCreation(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <>
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col items-center text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
            <p className="text-gray-600">
              {projects.length === 0
                ? "Create and manage your projects with time tracking and billing"
                : `Managing ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center space-x-4 ml-4">
            <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      {projects.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select
                value={filters.client ?? ""}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, client: value }))}
              >
                <SelectTrigger className="w-[150px]">
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  {clientNames.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.billable ?? ""}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, billable: value }))}
              >
                <SelectTrigger className="w-[150px]">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Billable" />
                </SelectTrigger>
                <SelectContent>
                  {billableOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.template ?? ""}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, template: value }))}
              >
                <SelectTrigger className="w-[150px]">
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Projects Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="w-[90%] mx-auto">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              // Debug logging to see what data we're working with
              console.log('Rendering project:', project)
              if (project.team) {
                console.log('Project team:', project.team)
              }
              
              // Validate that all data is properly structured
              if (typeof project.client === 'object' && project.client) {
                console.log('Client object:', project.client)
              }
              
              // Comprehensive validation for all project properties
              const projectName = typeof project.name === 'string' ? project.name : 'Unnamed Project';
              const projectDescription = typeof project.description === 'string' ? project.description : 'No description';
              const projectClient = project.client && typeof project.client === 'object' && project.client.name 
                ? project.client.name 
                : (typeof project.client === 'string' ? project.client : 'No client');
              const projectStatus = typeof project.status === 'string' ? project.status : 'Unknown';
              const projectProgress = typeof project.progress === 'number' ? project.progress : 0;
              const projectTotalHours = typeof project.totalHours === 'number' ? project.totalHours : 0;
              const projectBillableRate = typeof project.billableRate === 'number' ? project.billableRate : 0;
              const projectBillableHours = typeof project.billableHours === 'number' ? project.billableHours : 0;
              const projectTotalCost = typeof project.totalCost === 'number' ? project.totalCost : 0;
              const projectIsBillable = typeof project.isBillable === 'boolean' ? project.isBillable : false;
              const projectCreatedDate = project.createdDate ? new Date(project.createdDate).toLocaleDateString() : "Unknown";
              const projectDeadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline";
              
              const nextStatus = getNextStatus(projectStatus)
              const overdue = isDeadlineOverdue(project.deadline ?? "");
              const near = isDeadlineNear(project.deadline ?? "");

              return (
                <Card key={project.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  {/* Deadline Warning */}
                  {project.deadline && isDeadlineOverdue(project.deadline) && projectStatus !== "Completed" && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            <strong>Deadline Overdue:</strong> This project was due on{" "}
                            {projectDeadline}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                          {projectName}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {projectDescription}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status Badge and Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={getStatusColor(projectStatus)}>
                        {React.createElement(getStatusIcon(projectStatus), { className: "h-3 w-3 mr-1" })}
                        {projectStatus}
                      </Badge>
                      {projectStatus !== "Completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(Number(project.id), nextStatus)}
                          disabled={statusLoading[project.id]}
                        >
                          {statusLoading[project.id] ? "Updating..." : `${projectStatus} → ${nextStatus}`}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Client Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>{projectClient}</span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{projectProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${projectProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Total Hours</span>
                        </div>
                        <div className="font-semibold">{projectTotalHours}h</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>Total Cost</span>
                        </div>
                        <div className="font-semibold">
                          {projectIsBillable ? `$${projectTotalCost.toLocaleString()}` : "Non-billable"}
                        </div>
                      </div>
                    </div>

                    {/* Billable Rate */}
                    {projectIsBillable && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Billable Rate</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600 mt-1">${projectBillableRate}/hour</div>
                        <div className="text-xs text-green-600 mt-1">
                          {projectBillableHours}h billable • $
                          {(projectBillableHours * projectBillableRate).toLocaleString()} earned
                        </div>
                      </div>
                    )}

                    {/* Project Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Created: {new Date(project.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {projects.length === 0 ? (
            // No projects exist at all
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="inline-block relative">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
                    <circle cx="60" cy="60" r="50" fill="#f3e8ff" stroke="#a855f7" strokeWidth="2" />
                    <circle cx="60" cy="60" r="40" fill="#ffffff" stroke="#a855f7" strokeWidth="2" />
                    <FolderOpen className="h-12 w-12 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Projects!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start organizing your work by creating your first project. Track time, manage team members, set billing
                rates, and monitor progress all in one place.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <span>Track Time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span>Manage Team</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                    <span>Set Billing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <span>Track Progress</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            // Projects exist but none match filters
            <div className="text-center py-16">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find the projects you're looking for
              </p>
              <div className="space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilters({ client: "", billable: "", template: "" })
                  }}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Clear Filters
                </Button>
                <Button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Project Modal */}
      <EnhancedProjectModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedProject(null)
        }}
        onSave={handleSaveProject}
        project={selectedProject}
        clients={clients}
      />
    </>
  )
}

