import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, UserPlus } from "lucide-react";

export default function CreateUserProfile() {
    const { currentUser } = useAuth();
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("client");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        setSuccess(false);

        try {
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                fullName: fullName,
                role: role,
                createdAt: new Date(),
                avatarUrl: null
            });

            setSuccess(true);
            console.log('✅ User profile created!');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error("Error creating user profile:", error);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="p-4 max-w-md mx-auto">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">Please login first.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="p-4 max-w-md mx-auto">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Profile Created!</h2>
                        <p className="text-gray-600">Redirecting to dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="h-6 w-6" />
                    Create User Profile
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Set up your profile to continue
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Currently logged in as: <strong>{currentUser.email}</strong>
                        <br />
                        UID: <code className="text-xs">{currentUser.uid}</code>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="client">Client</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating..." : "Create Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
