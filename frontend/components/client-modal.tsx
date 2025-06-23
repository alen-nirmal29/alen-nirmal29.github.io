"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiRequest } from "@/lib/auth"
import { auth } from "@/lib/auth"

interface Client {
  id?: number | string;
  name: string;
  // Note: Backend only supports name field, other fields are frontend-only for future use
  email?: string;
  address?: string;
  note?: string;
  currency?: string;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  client?: Client | null;
}

export function ClientModal({ isOpen, onClose, onSave, client }: ClientModalProps) {
  const [formData, setFormData] = useState<Client>({
    name: "",
    email: "",
    address: "",
    note: "",
    currency: "USD",
  })

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name || "",
          email: client.email || "",
          address: client.address || "",
          note: client.note || "",
          currency: client.currency || "USD",
        })
      } else {
        setFormData({
          name: "",
          email: "",
          address: "",
          note: "",
          currency: "USD",
        })
      }
    }
  }, [client, isOpen])

  const [clientNameSuggestions, setClientNameSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!formData.name) return
    setLoading(true)
    setError("")
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';
      console.log('API_BASE:', API_BASE);
      console.log('Form data:', formData);
      
      // Check if user is authenticated
      const isAuth = auth.isAuthenticated();
      console.log('User authenticated:', isAuth);
      
      if (!isAuth) {
        setError("You must be logged in to save clients.");
        setLoading(false);
        return;
      }
      
      let res;
      if (client?.id) {
        // Update existing client
        console.log('Updating existing client with ID:', client.id);
        res = await apiRequest(`${API_BASE}/projects/clients/${client.id}/`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        // Create new client
        console.log('Creating new client');
        res = await apiRequest(`${API_BASE}/projects/clients/`, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      
      console.log('API Response status:', res.status);
      console.log('API Response ok:', res.ok);
      
      if (res.ok) {
        const savedClient = await res.json();
        console.log('Saved client from backend:', savedClient);
        // Merge the saved client data with the frontend form data
        const fullClientData = {
          ...savedClient,
          email: formData.email,
          address: formData.address,
          note: formData.note,
          currency: formData.currency,
        };
        console.log('Full client data to save:', fullClientData);
        onSave(fullClientData);
        onClose();
      } else {
        const errorBody = await res.text();
        console.log('Error response body:', errorBody);
        let userMessage = "Failed to save client.";
        try {
          const errorJson = JSON.parse(errorBody);
          if (errorJson.name && errorJson.name[0] && errorJson.name[0].includes("already exists")) {
            userMessage = "A client with this name already exists.";
          } else if (errorJson.detail) {
            userMessage = errorJson.detail;
          }
        } catch (e) {
          // Not JSON, keep default message
        }
        setError(userMessage);
        console.error('Failed to save client', res.status, errorBody);
      }
    } catch (err) {
      console.error('Error saving client:', err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Client, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    handleSave()
  }

  const handleCancel = () => {
    setFormData({
      name: client?.name || "",
      email: client?.email || "",
      address: client?.address || "",
      note: client?.note || "",
      currency: client?.currency || "USD",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{client ? "Edit Client" : "Add Client"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
              required
              disabled={loading}
              list="client-name-suggestions"
            />
            <datalist id="client-name-suggestions">
              {clientNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Textarea
              id="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full min-h-[80px] resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <Textarea
              id="note"
              placeholder="Enter note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              className="w-full min-h-[80px] resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCancel} className="text-gray-600 hover:text-gray-800" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6" disabled={loading}>
              {loading ? "Saving..." : "SAVE"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
