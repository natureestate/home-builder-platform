import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Calendar, DollarSign } from "lucide-react";

export default function ProjectOverview({ project }) {
    // Calculate progress based on installments (mock for now)
    const progress = 0;

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative h-48 bg-gray-200 rounded-b-3xl overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=2574&auto=format&fit=crop"
                    alt="Project Hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                    <div className="text-white">
                        <h1 className="text-2xl font-bold">{project.projectName}</h1>
                        <p className="text-sm opacity-90">{project.projectCode}</p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* Status & Progress */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Project Status</CardTitle>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                                {project.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Overall Progress</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                            <MapPin className="h-6 w-6 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm font-medium">{project.location}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                            <DollarSign className="h-6 w-6 text-green-500" />
                            <div>
                                <p className="text-xs text-gray-500">Total Price</p>
                                <p className="text-sm font-medium">฿{project.totalPrice?.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity (Placeholder) */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Project Created</p>
                                <p className="text-xs text-gray-500">
                                    {project.createdAt?.toDate().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
