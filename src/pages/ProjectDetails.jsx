import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, orderBy, query, addDoc, serverTimestamp, updateDoc, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, DollarSign, Plus, Upload, Settings, UserPlus, Trash2, Copy, Check } from "lucide-react";

export default function ProjectDetails() {
    const { id } = useParams();
    const { currentUser, userRole } = useAuth();
    const [project, setProject] = useState(null);
    const [installments, setInstallments] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [assignedStaff, setAssignedStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Request Form State
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({ title: "", detail: "", type: "memo", priceImpact: 0 });
    const [submitting, setSubmitting] = useState(false);

    // Upload State
    const [uploadingId, setUploadingId] = useState(null);

    // Settings State
    const [inviteLink, setInviteLink] = useState("");
    const [staffEmail, setStaffEmail] = useState("");
    const [staffSearchLoading, setStaffSearchLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        setLoading(true);
        try {
            // Fetch Project Details
            const projectRef = doc(db, "projects", id);
            const projectSnap = await getDoc(projectRef);

            if (projectSnap.exists()) {
                const projectData = projectSnap.data();
                setProject({ id: projectSnap.id, ...projectData });

                // Fetch Installments
                const installmentsRef = collection(db, "projects", id, "installments");
                const installmentsQuery = query(installmentsRef, orderBy("sequence", "asc"));
                const installmentsSnap = await getDocs(installmentsQuery);
                setInstallments(installmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Change Requests
                const crRef = collection(db, "projects", id, "change_requests");
                const crQuery = query(crRef, orderBy("createdAt", "desc"));
                const crSnap = await getDocs(crQuery);
                setChangeRequests(crSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Assigned Staff Details
                if (projectData.assignedStaffIds && projectData.assignedStaffIds.length > 0) {
                    // Firestore 'in' query supports up to 10 items. For MVP assume < 10 staff per project.
                    const usersRef = collection(db, "users");
                    const staffQuery = query(usersRef, where("id", "in", projectData.assignedStaffIds));
                    const staffSnap = await getDocs(staffQuery);
                    setAssignedStaff(staffSnap.docs.map(doc => doc.data()));
                } else {
                    setAssignedStaff([]);
                }

            } else {
                console.error("Project not found");
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "projects", id, "change_requests"), {
                ...newRequest,
                priceImpact: Number(newRequest.priceImpact),
                status: "draft",
                requestedBy: currentUser.uid,
                createdAt: serverTimestamp(),
                images: []
            });

            setIsRequestDialogOpen(false);
            setNewRequest({ title: "", detail: "", type: "memo", priceImpact: 0 });
            fetchData();
        } catch (error) {
            console.error("Error creating request:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUploadSlip = async (event, installmentId) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingId(installmentId);
        try {
            const storageRef = ref(storage, `slips/${id}/${installmentId}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const installmentRef = doc(db, "projects", id, "installments", installmentId);
            await updateDoc(installmentRef, {
                slipUrl: downloadURL,
                status: "paid",
                paidAt: serverTimestamp()
            });

            fetchData();
        } catch (error) {
            console.error("Error uploading slip:", error);
            alert("Failed to upload slip.");
        } finally {
            setUploadingId(null);
        }
    };

    const handleGenerateInvite = async () => {
        try {
            const inviteRef = await addDoc(collection(db, "invites"), {
                projectId: id,
                roleToAssign: "client",
                status: "pending",
                createdAt: serverTimestamp()
            });
            const link = `${window.location.origin}/invite/${inviteRef.id}`;
            setInviteLink(link);
        } catch (error) {
            console.error("Error generating invite:", error);
        }
    };

    const handleAddStaff = async () => {
        if (!staffEmail) return;
        setStaffSearchLoading(true);
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", staffEmail), where("role", "==", "staff"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("Staff user not found with this email.");
            } else {
                const staffUser = querySnapshot.docs[0].data();
                const projectRef = doc(db, "projects", id);
                await updateDoc(projectRef, {
                    assignedStaffIds: arrayUnion(staffUser.id)
                });
                setStaffEmail("");
                fetchData();
            }
        } catch (error) {
            console.error("Error adding staff:", error);
        } finally {
            setStaffSearchLoading(false);
        }
    };

    const handleRemoveStaff = async (staffId) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            const projectRef = doc(db, "projects", id);
            await updateDoc(projectRef, {
                assignedStaffIds: arrayRemove(staffId)
            });
            fetchData();
        } catch (error) {
            console.error("Error removing staff:", error);
        }
    };

    if (loading) {
        return (
            <div className="p-4 space-y-4 max-w-md mx-auto">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (!project) {
        return <div className="p-4 text-center">Project not found.</div>;
    }

    return (
        <div className="p-4 max-w-md mx-auto space-y-6 pb-20">
            <header className="flex items-center gap-2">
                <Link to="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{project.projectName}</h1>
                    <p className="text-xs text-gray-500">{project.projectCode}</p>
                </div>
            </header>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between">
                        <CardTitle className="text-base">Project Status</CardTitle>
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>
                            {project.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium">{project.location}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total Price</span>
                        <span className="font-medium">฿{project.totalPrice?.toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="installments" className="w-full">
                <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <TabsTrigger value="installments">Installments</TabsTrigger>
                    <TabsTrigger value="memos">Memos</TabsTrigger>
                    {userRole === 'admin' && <TabsTrigger value="settings">Settings</TabsTrigger>}
                </TabsList>

                <TabsContent value="installments" className="space-y-4 mt-4">
                    {installments.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No installments found.</p>
                    ) : (
                        installments.map((inst) => (
                            <Card key={inst.id}>
                                <CardContent className="p-4 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                <DollarSign className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{inst.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    Due: {inst.dueDate?.seconds ? new Date(inst.dueDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">฿{inst.amount?.toLocaleString()}</p>
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                {inst.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {(inst.status === 'pending' || inst.status === 'ready_to_pay') && (
                                        <div className="flex justify-end">
                                            <input
                                                type="file"
                                                id={`upload-${inst.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleUploadSlip(e, inst.id)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto"
                                                disabled={uploadingId === inst.id}
                                                onClick={() => document.getElementById(`upload-${inst.id}`).click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {uploadingId === inst.id ? "Uploading..." : "Upload Slip"}
                                            </Button>
                                        </div>
                                    )}
                                    {inst.slipUrl && (
                                        <div className="flex justify-end">
                                            <a href={inst.slipUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                View Slip
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="memos" className="space-y-4 mt-4">
                    <div className="flex justify-end mb-2">
                        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gap-1">
                                    <Plus className="h-4 w-4" /> New Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Change Request</DialogTitle>
                                    <DialogDescription>Submit a new memo, add order, or deduct order.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateRequest} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            required
                                            value={newRequest.title}
                                            onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                                            placeholder="e.g., Change floor tile"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Type</label>
                                        <Select
                                            value={newRequest.type}
                                            onValueChange={(val) => setNewRequest({ ...newRequest, type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="memo">Memo (No Price Impact)</SelectItem>
                                                <SelectItem value="add_order">Add Order (Extra Cost)</SelectItem>
                                                <SelectItem value="deduct_order">Deduct Order (Refund)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {newRequest.type !== 'memo' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Price Impact (฿)</label>
                                            <Input
                                                type="number"
                                                required
                                                value={newRequest.priceImpact}
                                                onChange={(e) => setNewRequest({ ...newRequest, priceImpact: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Details</label>
                                        <Textarea
                                            required
                                            value={newRequest.detail}
                                            onChange={(e) => setNewRequest({ ...newRequest, detail: e.target.value })}
                                            placeholder="Describe the change..."
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? "Submitting..." : "Submit Request"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {changeRequests.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No change requests found.</p>
                    ) : (
                        changeRequests.map((cr) => (
                            <Card key={cr.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium text-sm">{cr.title}</span>
                                        </div>
                                        <Badge variant={cr.status === "approved" ? "success" : "secondary"}>
                                            {cr.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{cr.detail}</p>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={`font-medium ${cr.type === 'add_order' ? 'text-red-500' : cr.type === 'deduct_order' ? 'text-green-500' : 'text-gray-500'}`}>
                                            {cr.type === 'memo' ? 'Memo' : cr.type === 'add_order' ? `+฿${cr.priceImpact?.toLocaleString()}` : `-฿${cr.priceImpact?.toLocaleString()}`}
                                        </span>
                                        <span className="text-gray-400">
                                            {cr.createdAt?.seconds ? new Date(cr.createdAt.seconds * 1000).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {userRole === 'admin' && (
                    <TabsContent value="settings" className="space-y-6 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Client Onboarding</CardTitle>
                                <CardDescription>Generate an invite link for the client.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {inviteLink ? (
                                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded border border-gray-200">
                                        <code className="text-xs flex-1 break-all">{inviteLink}</code>
                                        <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(inviteLink)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={handleGenerateInvite} variant="outline" className="w-full">
                                        Generate Invite Link
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Staff Management</CardTitle>
                                <CardDescription>Assign staff members to this project.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Staff Email"
                                        value={staffEmail}
                                        onChange={(e) => setStaffEmail(e.target.value)}
                                    />
                                    <Button onClick={handleAddStaff} disabled={staffSearchLoading}>
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {assignedStaff.map(staff => (
                                        <div key={staff.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                                    {staff.fullName ? staff.fullName[0] : staff.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{staff.fullName || 'Staff'}</p>
                                                    <p className="text-xs text-gray-500">{staff.email}</p>
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveStaff(staff.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {assignedStaff.length === 0 && (
                                        <p className="text-center text-gray-500 text-sm py-2">No staff assigned.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
