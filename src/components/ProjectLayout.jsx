import { Home, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProjectLayout({ children, projectId }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Simple active state check
    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Main Content Area */}
            <main className="max-w-md mx-auto">
                {children}
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-50 md:max-w-md md:mx-auto md:left-0 md:right-0">
                <Button
                    variant="ghost"
                    className={`flex flex-col items-center gap-1 h-auto py-2 ${isActive(`/projects/${projectId}`) ? "text-blue-600" : "text-gray-400"}`}
                    onClick={() => navigate(`/projects/${projectId}`)}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[10px]">Home</span>
                </Button>
                <Button
                    variant="ghost"
                    className={`flex flex-col items-center gap-1 h-auto py-2 ${isActive(`/projects/${projectId}/installments`) ? "text-blue-600" : "text-gray-400"}`}
                    onClick={() => navigate(`/projects/${projectId}/installments`)}
                >
                    <FileText className="h-5 w-5" />
                    <span className="text-[10px]">Installments</span>
                </Button>
                <Button
                    variant="ghost"
                    className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
                    onClick={() => console.log("Menu clicked")}
                >
                    <Menu className="h-5 w-5" />
                    <span className="text-[10px]">Menu</span>
                </Button>
            </div>
        </div>
    );
}
