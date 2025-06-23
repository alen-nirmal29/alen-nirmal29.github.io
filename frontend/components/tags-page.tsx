"use client"

import { useState, useEffect } from "react"
import { Search, MoreVertical, Plus, TagIcon, Clock, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/auth"

interface Tag {
  id?: string | number
  name: string
  color?: string
  description?: string
}

function TagModal({ open, onClose, onSave, tag }: { open: boolean, onClose: () => void, onSave: (tag: Tag) => void, tag: Tag | null }) {
  const [form, setForm] = useState<Tag>(tag || { name: "", color: "", description: "" })
  useEffect(() => { setForm(tag || { name: "", color: "", description: "" }) }, [tag, open])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{tag ? "Edit Tag" : "Add Tag"}</h2>
        <div className="space-y-4">
          <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input placeholder="Color (e.g. bg-blue-500)" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>{tag ? "Save" : "Add"}</Button>
        </div>
      </div>
    </div>
  )
}

export function TagsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tags, setTags] = useState<Tag[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiRequest("/api/projects/tags/")
        const data = await response.json()
        setTags(data)
      } catch (error) {
        console.error("Failed to fetch tags:", error)
      }
    }
    fetchTags()
  }, [])

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddTag = () => {
    setEditingTag(null)
    setModalOpen(true)
  }

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setModalOpen(true)
  }

  const handleDeleteTag = async (id: string | number) => {
    try {
      await apiRequest(`/api/projects/tags/${id}/`, { method: "DELETE" })
      setTags(tags.filter(tag => tag.id !== id))
    } catch (error) {
      console.error("Failed to delete tag:", error)
    }
  }

  const handleSaveTag = async (tagData: Tag) => {
    try {
      console.log("Saving tag:", tagData)
      if (tagData.id) {
        // Edit existing tag
        const res = await apiRequest(`/api/projects/tags/${tagData.id}/`, {
          method: "PATCH",
          body: JSON.stringify(tagData)
        })
        const updatedTag = await res.json()
        setTags(tags.map(tag => tag.id === updatedTag.id ? updatedTag : tag))
      } else {
        // Add new tag
        const res = await apiRequest(`/api/projects/tags/`, {
          method: "POST",
          body: JSON.stringify(tagData)
        })
        const newTag = await res.json()
        setTags([...tags, newTag])
      }
      setModalOpen(false)
    } catch (error) {
      console.error("Failed to save tag:", error)
    }
  }

  return (
    <>
      <TagModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTag} tag={editingTag} />
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col items-center text-center flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">Tags</h1>
          </div>
          <Button onClick={handleAddTag} className="bg-green-500 hover:bg-green-600 text-white px-6 ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Search (centered) */}
          <div className="flex justify-center mb-6 w-full">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>
          {/* Tags Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
                <TagIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length}</div>
                <p className="text-xs text-muted-foreground">Use tags to categorize your time entries</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Used Tag</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tags.length > 0 ? tags[0].name : "No tags yet"}</div>
                <p className="text-xs text-muted-foreground">
                  {tags.length > 0 ? "Based on time entries" : "Add tags to track usage"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tag Usage</CardTitle>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 entries</div>
                <p className="text-xs text-muted-foreground">Apply tags to time entries to see usage</p>
              </CardContent>
            </Card>
          </div>
          {/* Tags List */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>All Tags</CardTitle>
              <CardDescription>Manage and organize your time tracking tags</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTags.length === 0 ? (
                <div className="text-center py-10">
                  <div className="flex justify-center mb-4">
                    <TagIcon className="h-16 w-16 text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? "No tags match your search" : "No tags have been created yet"}
                  </p>
                  <Button onClick={handleAddTag} className="bg-green-500 hover:bg-green-600 text-white px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Tag
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTags.map((tag) => {
                    // Determine background style
                    let bgStyle = {}
                    let bgClass = ''
                    if (tag.color) {
                      if (tag.color.startsWith('#') || tag.color.startsWith('rgb')) {
                        bgStyle = { backgroundColor: tag.color }
                      } else {
                        bgClass = tag.color
                      }
                    }
                    return (
                      <div key={tag.id} className={`border rounded-lg p-4 flex items-start justify-between bg-white`} style={bgStyle}>
                        <div className={`flex items-start space-x-3`}>
                          <div className={`w-4 h-4 rounded-full mt-1 ${bgClass}`} style={bgStyle}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{tag.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tag.description || "No description"}</p>
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">0 entries</Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTag(tag)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTag(tag.id!)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
