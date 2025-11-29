import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle } from "lucide-react";

export default function Invite() {
    const { token } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [invite, setInvite] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        async function checkInvite() {
            try {
                const inviteRef = doc(db, "invites", token);
                const inviteSnap = await getDoc(inviteRef);

                if (inviteSnap.exists()) {
                    const inviteData = inviteSnap.data();
                    if (inviteData.status === "used") {
                        setError("This invite link has already been used.");
                    } else {
                        setInvite({ id: inviteSnap.id, ...inviteData });
                        // Fetch project info
                        const projectRef = doc(db, "projects", inviteData.projectId);
                        const projectSnap = await getDoc(projectRef);
                        if (projectSnap.exists()) {
                            setProject(projectSnap.data());
                        } else {
                            setError("Project associated with this invite not found.");
                        }
                    }
                } else {
                    setError("Invalid invite link.");
                }
            } catch (err) {
                console.error("Error checking invite:", err);
                setError("Failed to verify invite.");
            } finally {
                setLoading(false);
            }
        }

        checkInvite();
    }, [token]);

    const handleAcceptInvite = async () => {
        if (!currentUser) {
            // Redirect to login, preserving the invite URL to return to
            navigate(`/login?redirect=/invite/${token}`);
            return;
        }

        setProcessing(true);
        try {
            const projectRef = doc(db, "projects", invite.projectId);
            const inviteRef = doc(db, "invites", token);

            // Update Project Owner
            if (invite.roleToAssign === "client") {
                await updateDoc(projectRef, {
                    ownerId: currentUser.uid
                });
            } else if (invite.roleToAssign === "staff") {
                // Logic for staff assignment if needed via invite (though requirements say Admin assigns staff manually)
                // But if we support staff invites:
                await updateDoc(projectRef, {
                    // arrayUnion would be better but simple update for now
                    // assignedStaffIds: arrayUnion(currentUser.uid) 
                });
            }

            // Mark invite as used
            await updateDoc(inviteRef, {
                status: "used",
                usedBy: currentUser.uid,
                usedAt: serverTimestamp()
            });

            // Update user role if needed (optional, depending on if we want to force role)
            // For now, assume user already has a role or we don't change it here.

            navigate(`/projects/${invite.projectId}`);
        } catch (err) {
            console.error("Error accepting invite:", err);
            setError("Failed to accept invite.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="space-y-4 w-full max-w-md">
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-2">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-red-600">Invite Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/">
                            <Button variant="outline">Go Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>You're Invited!</CardTitle>
                    <CardDescription>
                        You have been invited to join the project <strong>{project?.projectName}</strong> as a {invite?.roleToAssign}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                        <p><strong>Project Code:</strong> {project?.projectCode}</p>
                        <p><strong>Location:</strong> {project?.location}</p>
                    </div>

                    {!currentUser ? (
                        <div className="text-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                            Please login to accept this invite.
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500">
                            Logged in as <strong>{currentUser.email}</strong>
                        </div>
                    )}

                    <Button onClick={handleAcceptInvite} className="w-full" disabled={processing}>
                        {processing ? "Processing..." : currentUser ? "Accept Invite" : "Login to Accept"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
