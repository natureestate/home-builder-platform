import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Home, Users } from "lucide-react";
import CreateProjectDialog from "@/components/CreateProjectDialog";

export default function Dashboard() {
    const { currentUser, userRole } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [currentUser, userRole]);

    async function fetchProjects() {
        if (!currentUser) return;

        setLoading(true);
        try {
            console.log("🔍 Debug Info:");
            console.log("User UID:", currentUser.uid);
            console.log("User Email:", currentUser.email);
            console.log("User Role:", userRole);

            let q;
            const projectsRef = collection(db, "projects");

            if (userRole === "admin") {
                q = query(projectsRef, orderBy("createdAt", "desc"));
            } else if (userRole === "staff") {
                q = query(
                    projectsRef,
                    where("assignedStaffIds", "array-contains", currentUser.uid)
                );
            } else if (userRole === "client") {
                q = query(
                    projectsRef,
                    where("ownerId", "==", currentUser.uid)
                );
            } else {
                setProjects([]);
                setLoading(false);
                return;
            }

            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log("📊 Projects found:", projectsData.length);
            console.log("Projects data:", projectsData);

            if (userRole !== "admin") {
                projectsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            }

            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="p-4 space-y-4 max-w-md mx-auto">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    return (
        <div className="p-4 max-w-md mx-auto space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {userRole === "client" ? "My Home" : "Projects"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Welcome back, {currentUser.displayName || currentUser.email}
                    </p>
                </div>
                {userRole === "admin" && (
                    <>
                        <Button size="icon" variant="outline" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <CreateProjectDialog
                            open={isCreateOpen}
                            onOpenChange={setIsCreateOpen}
                            onProjectCreated={fetchProjects}
                        />
                    </>
                )}
            </header>

            {projects.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No projects found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <Link key={project.id} to={`/projects/${project.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-98 transition-transform">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{project.projectName}</CardTitle>
                                        <Badge variant={project.status === "active" ? "default" : "secondary"}>
                                            {project.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>{project.projectCode}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">{project.location}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Mobile Bottom Nav (Placeholder for now, maybe move to Layout later) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center md:hidden">
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
                    <Home className="h-5 w-5" />
                    <span className="text-[10px]">Home</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400">
                    <Users className="h-5 w-5" />
                    <span className="text-[10px]">Profile</span>
                </Button>
            </div>
        </div>
    );
}
