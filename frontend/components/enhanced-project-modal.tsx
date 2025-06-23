"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, DollarSign, FileText, Building, Calendar, User, Users, Palette, Tag, CheckSquare, Plus, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Client, Project } from "@/types" // Import custom types

interface EnhancedProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: any) => void
  project?: Project | null // Use a specific type
  clients?: Client[] // Pass in clients
  teamMembers?: any[] // Pass in team members
}

const PROJECT_TEMPLATES = [
  {
    id: "web-development",
    name: "Web Development",
    description: "Full-stack web application development",
    defaultBillable: true,
    suggestedRate: 75,
  },
  {
    id: "mobile-app",
    name: "Mobile App Development",
    description: "iOS/Android mobile application development",
    defaultBillable: true,
    suggestedRate: 85,
  },
  {
    id: "ui-ux-design",
    name: "UI/UX Design",
    description: "User interface and experience design",
    defaultBillable: true,
    suggestedRate: 65,
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Strategic consulting and advisory services",
    defaultBillable: true,
    suggestedRate: 150,
  },
  {
    id: "marketing",
    name: "Marketing Campaign",
    description: "Digital marketing and campaign management",
    defaultBillable: true,
    suggestedRate: 55,
  },
  {
    id: "content-creation",
    name: "Content Creation",
    description: "Content writing, blogging, and copywriting",
    defaultBillable: true,
    suggestedRate: 45,
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description: "Data analysis and business intelligence",
    defaultBillable: true,
    suggestedRate: 95,
  },
  {
    id: "internal-project",
    name: "Internal Project",
    description: "Internal company project or initiative",
    defaultBillable: false,
    suggestedRate: 0,
  },
  {
    id: "research",
    name: "Research & Development",
    description: "Research and development activities",
    defaultBillable: false,
    suggestedRate: 0,
  },
  {
    id: "maintenance",
    name: "Maintenance & Support",
    description: "Ongoing maintenance and technical support",
    defaultBillable: true,
    suggestedRate: 65,
  },
]

export function EnhancedProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  clients = [],
  teamMembers = [],
}: EnhancedProjectModalProps) {
  type ProjectFormData = {
    name: string
    client: string
    description: string
    template: string
    deadline: string
    isBillable: boolean
    billableRate: string
    status: string
    progress: string
  }

  const [formData, setFormData] = useState<Omit<ProjectFormData, 'team' | 'tags'>>({
    name: "",
    client: "",
    description: "",
    template: "",
    deadline: "",
    isBillable: true,
    billableRate: "",
    status: "Planning",
    progress: "0",
  })

  // State for new client creation
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [newClientName, setNewClientName] = useState("")

  // UseEffect to reset and populate form when project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        // Editing an existing project
        setFormData({
          name: project.name || "",
          client: project.client || "",
          description: project.description || "",
          template: project.template || "",
          deadline: project.deadline || "",
          isBillable: project.isBillable ?? true,
          billableRate: project.billableRate?.toString() || "",
          status: project.status || "Planning",
          progress: project.progress?.toString() || "0",
        })
      } else {
        // Creating a new project, reset form
        setFormData({
          name: "",
          client: "",
          description: "",
          template: "",
          deadline: "",
          isBillable: true,
          billableRate: "0",
          status: "Planning",
          progress: "0",
        })
      }
    }
  }, [isOpen, project])

  const handleInputChange = (field: keyof Omit<ProjectFormData, 'team' | 'tags'>, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTemplateChange = (templateId: string) => {
    const template = PROJECT_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        template: template.id,
        description: prev.description || template.description,
        isBillable: template.defaultBillable,
        billableRate: template.suggestedRate.toString(),
      }))
    }
  }

  const handleClientCreate = () => {
    // Basic validation
    if (newClientName.trim()) {
      // In a real app, you'd call an API to create the client.
      // Here, we'll just add it to the list and select it.
      const newClient: Client = { id: Date.now(), name: newClientName }
      clients.push(newClient)
      handleInputChange("client", newClient.name)
      setIsCreatingClient(false)
      setNewClientName("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...formData, id: project?.id })
    onClose()
  }

  if (!isOpen) return null

  const getClientName = (client: any) => (typeof client === 'object' && client !== null ? client.name : client);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {project ? "Edit Project Details" : "Create a New Project"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          {/* Project Name and Template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-base font-semibold text-gray-700">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., E-commerce Platform Redesign"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template" className="text-base font-semibold text-gray-700">Project Template</Label>
              <Select value={formData.template} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template" className="text-lg">
                  <SelectValue placeholder="Start with a template..." />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold text-gray-700">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a summary of the project goals, scope, and deliverables."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          {/* Client Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-700">Client</Label>
            {!isCreatingClient ? (
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.client ? clients.find((c) => c.name === formData.client)?.name : "Select client..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search client..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.name}
                              onSelect={(currentValue) => {
                                handleInputChange("client", currentValue === formData.client ? "" : currentValue)
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.client === c.name ? "opacity-100" : "opacity-0")} />
                              {c.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" onClick={() => setIsCreatingClient(true)}>
                  <Plus className="h-4 w-4 mr-2" /> New
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter new client name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
                <Button onClick={handleClientCreate}>Save Client</Button>
                <Button variant="ghost" onClick={() => setIsCreatingClient(false)}>Cancel</Button>
              </div>
            )}
          </div>

          {/* Billable and Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="flex items-center space-x-4 pt-6">
              <Switch
                id="isBillable"
                checked={formData.isBillable}
                onCheckedChange={(checked) => handleInputChange("isBillable", checked)}
              />
              <Label htmlFor="isBillable" className="text-base font-semibold text-gray-700">
                Billable Project
              </Label>
            </div>
            {formData.isBillable && (
              <div className="space-y-2">
                <Label htmlFor="billableRate" className="text-base font-semibold text-gray-700">Hourly Rate</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="billableRate"
                    type="number"
                    placeholder="e.g., 75"
                    value={formData.billableRate}
                    onChange={(e) => handleInputChange("billableRate", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <Button variant="ghost" onClick={onClose} className="mr-4">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
            {project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  )
}
