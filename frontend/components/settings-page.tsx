"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import {
  User,
  Bell,
  Shield,
  Palette,
  Clock,
  DollarSign,
  Download,
  Trash2,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Key,
  Users,
  Zap,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Wifi,
  Database,
  FileText,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { apiRequest } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"

export function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    company: "",
    bio: "",
    location: "",
    website: "",
    timezone: "",
    avatar: "",
  });
  // Store avatar file separately for FormData
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const res = await apiRequest("/api/user-settings/profile/", {
          method: "GET"
        })
        const data = await res.json()
        // Ensure all fields have string values to prevent controlled/uncontrolled input errors
        setProfileData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          job_title: data.job_title || "",
          company: data.company || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          timezone: data.timezone || "",
          avatar: data.avatar || "",
        })
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthenticated) {
      fetchProfile()
    } else {
      setLoading(false)
      setError("Please log in to access settings")
    }
  }, [isAuthenticated])

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Append all profile data fields to formData, except the avatar
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });
      
      // If there's a new avatar file, append it
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await apiRequest("/api/user-settings/profile/", {
        method: "PATCH",
        body: formData,
      });

      const updatedProfile = await res.json();
      
      // Update local state, ensuring avatar URL is correctly handled
      setProfileData({
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        email: updatedProfile.email || "",
        phone: updatedProfile.phone || "",
        job_title: updatedProfile.job_title || "",
        company: updatedProfile.company || "",
        bio: updatedProfile.bio || "",
        location: updatedProfile.location || "",
        website: updatedProfile.website || "",
        timezone: updatedProfile.timezone || "",
        avatar: updatedProfile.avatar || profileData.avatar || "",
      });

      // Clear the avatar file state after successful upload
      setAvatarFile(null);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    try {
      const res = await apiRequest("/api/user-settings/delete-account/", {
        method: "DELETE"
      })
      
      if (res.ok) {
        // Clear local storage and redirect to login
        localStorage.clear()
        window.location.href = "/login"
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setAvatarFile(file);
        // For preview, show the selected file as a data URL
        const reader = new FileReader();
        reader.onload = (ev) => {
          setProfileData((prev) => ({ ...prev, avatar: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col items-center text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and application settings</p>
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <Button variant="outline" className="text-gray-600">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            {success && <span className="text-green-600 ml-4">Profile saved!</span>}
            {error && <span className="text-red-600 ml-4">{error}</span>}
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="w-[90%] mx-auto">
          <Tabs value="profile" className="space-y-6">
            <TabsContent value="profile">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <CardDescription>Update your personal information and profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt="Profile" />
                        <AvatarFallback className="text-lg">
                          {profileData.first_name?.[0]}
                          {profileData.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        onClick={handleAvatarUpload}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profileData.first_name} {profileData.last_name}
                      </h3>
                      <p className="text-gray-600">{profileData.job_title}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={handleAvatarUpload}>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => handleProfileUpdate("first_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => handleProfileUpdate("last_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileUpdate("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={profileData.job_title}
                        onChange={(e) => handleProfileUpdate("job_title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => handleProfileUpdate("company", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleProfileUpdate("location", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) => handleProfileUpdate("website", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">About Yourself</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Tell us about yourself, your experience, and interests..."
                    />
                  </div>

                  {/* Timezone */}
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={profileData.timezone}
                      onValueChange={(value) => handleProfileUpdate("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
                    </div>
                    <p className="text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={deleteLoading}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deleteLoading ? "Deleting..." : "Delete Account"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
