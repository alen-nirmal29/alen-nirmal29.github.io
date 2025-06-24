"use client"

import { useState, useEffect } from "react"
import { Search, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ClientModal } from "./client-modal"
import { apiRequest, API_BASE } from '@/lib/auth'

interface Client {
  id?: number | string;
  name: string;
  email?: string;
  address?: string;
  note?: string;
  currency?: string;
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showActive, setShowActive] = useState("active")
  const [selectedClients, setSelectedClients] = useState<number[]>([]) // Use number[]

  // Fetch clients from backend
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await apiRequest(`${API_BASE}/projects/clients/`);
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      }
    }
    fetchClients();
  }, [API_BASE]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(
        filteredClients
          .map((client) => Number(client.id))
          .filter((id) => !isNaN(id))
      );
    } else {
      setSelectedClients([])
    }
  }

  const handleSelectClient = (clientId: number, checked: boolean) => {
    if (checked) {
      setSelectedClients((prev) => [...prev, clientId])
    } else {
      setSelectedClients((prev) => prev.filter((id) => id !== clientId))
    }
  }

  const handleAddClient = () => {
    setEditingClient(null)
    setIsModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDeleteClient = async (clientId: number) => {
    try {
      const res = await apiRequest(`${API_BASE}/projects/clients/${clientId}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setClients((prev) => prev.filter((client) => client.id !== clientId));
        setSelectedClients((prev) => prev.filter((id) => id !== clientId));
      } else {
        let userMessage = "Failed to delete client.";
        try {
          const errorBody = await res.text();
          const errorJson = JSON.parse(errorBody);
          if (errorJson.detail) {
            userMessage = errorJson.detail;
          }
        } catch (e) {
          // Not JSON or no detail, keep default message
        }
        alert(userMessage);
        console.error('Failed to delete client');
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  }

  const handleSaveClient = async (client: Client) => {
    // The modal now handles all API calls, so we just need to update the local state
    if (client.id) {
      // Update existing client in the list
      setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    } else {
      // Add new client to the list
      setClients((prev) => [...prev, client]);
    }
  }


  return (
    <>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col items-center text-center flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">Clients</h1>
          </div>
          <Button onClick={handleAddClient} className="bg-blue-500 hover:bg-blue-600 text-white px-6 ml-4">
            Add new Client
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex flex-col items-center text-center w-full space-y-2">
          <div className="flex items-center justify-center space-x-4 w-full">
            <Select value={showActive} onValueChange={setShowActive}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Show active</SelectItem>
                <SelectItem value="all">Show all</SelectItem>
                <SelectItem value="archived">Show archived</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-sm mx-6 mt-6 rounded-lg shadow-sm">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/80 rounded-t-lg">
          <span className="text-sm font-medium text-gray-600">Clients</span>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1">
              <Checkbox
                checked={filteredClients.length > 0 && selectedClients.length === filteredClients.length}
                onCheckedChange={handleSelectAll}
              />
            </div>
            <div className="col-span-4">
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">NAME</span>
            </div>
            {/* Remove ADDRESS and CURRENCY columns since backend doesn't provide them */}
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredClients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No clients found</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div key={client.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <Checkbox
                      checked={selectedClients.includes(Number(client.id))}
                      onCheckedChange={(checked) => handleSelectClient(Number(client.id), checked as boolean)}
                    />
                  </div>
                  <div className="col-span-4">
                    <span className="text-sm font-medium text-gray-900">{client.name}</span>
                  </div>
                  {/* Remove address and currency values since backend doesn't provide them */}
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClient(client)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClient(Number(client.id))}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        client={editingClient}
      />
    </>
  );
}
