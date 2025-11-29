import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateProjectDialog({ open, onOpenChange, onProjectCreated }) {
    const [newProject, setNewProject] = useState({
        projectName: "",
        projectCode: "",
        location: "",
        totalPrice: ""
    });
    const [creating, setCreating] = useState(false);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await addDoc(collection(db, "projects"), {
                ...newProject,
                totalPrice: Number(newProject.totalPrice),
                status: "active",
                createdAt: serverTimestamp(),
                ownerId: "", // Will be assigned via invite
                assignedStaffIds: []
            });

            setNewProject({ projectName: "", projectCode: "", location: "", totalPrice: "" });
            onOpenChange(false);
            if (onProjectCreated) onProjectCreated();
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Enter project details to start.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                            id="projectName"
                            required
                            value={newProject.projectName}
                            onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                            placeholder="e.g., Modern Loft House"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="projectCode">Project Code</Label>
                        <Input
                            id="projectCode"
                            required
                            value={newProject.projectCode}
                            onChange={(e) => setNewProject({ ...newProject, projectCode: e.target.value })}
                            placeholder="e.g., HBP-24-001"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            required
                            value={newProject.location}
                            onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                            placeholder="e.g., Bangkok, Thailand"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="totalPrice">Total Price (฿)</Label>
                        <Input
                            id="totalPrice"
                            required
                            type="number"
                            value={newProject.totalPrice}
                            onChange={(e) => setNewProject({ ...newProject, totalPrice: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={creating}>
                            {creating ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
