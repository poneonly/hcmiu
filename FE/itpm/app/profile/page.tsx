"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useAuthStore } from "@/lib/store"
import { updateUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
    const { user, accessToken, updateUser } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        emailAlerts: true,
    })

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || "",
                fullName: user.fullName || "",
                emailAlerts: user.preferences?.emailAlerts ?? true,
            })
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !accessToken) {
            toast.error("You must be logged in to update your profile")
            return
        }

        setLoading(true)
        try {
            const updatedUser = await updateUserProfile(user.id, formData, accessToken)
            updateUser(updatedUser)
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <ProtectedLayout>
                <div className="p-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </ProtectedLayout>
        )
    }

    return (
        <ProtectedLayout>
            <div className="p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Student ID (Read-only) */}
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">
                                    Student ID
                                </label>
                                <Input
                                    value={user.studentId}
                                    disabled
                                    className="bg-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Student ID cannot be changed
                                </p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="text-sm font-medium text-foreground block mb-2">
                                    Full Name
                                </label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-foreground block mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Email Alerts */}
                            <div className="flex items-center gap-3 pt-2">
                                <Checkbox
                                    id="emailAlerts"
                                    checked={formData.emailAlerts}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, emailAlerts: checked as boolean })
                                    }
                                />
                                <label htmlFor="emailAlerts" className="text-sm font-medium text-foreground cursor-pointer">
                                    Receive email alerts and notifications
                                </label>
                            </div>

                            {/* Account Status */}
                            <div className="pt-4 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Account Status</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {user.verified ? "Verified" : "Not verified"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Role</p>
                                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                                            {user.role}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ProtectedLayout>
    )
}

