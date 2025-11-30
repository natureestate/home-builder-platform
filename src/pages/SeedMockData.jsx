import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, setDoc, doc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SeedMockData() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [logs, setLogs] = useState([]);

    const addLog = (message, type = "info") => {
        setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    };

    // Mock Users Data
    const mockUsers = [
        {
            id: 'admin-001',
            email: 'admin@homebuilder.com',
            fullName: 'Admin User',
            role: 'admin',
            createdAt: new Date(),
            avatarUrl: null
        },
        {
            id: 'staff-001',
            email: 'staff1@homebuilder.com',
            fullName: 'Somchai Builder',
            role: 'staff',
            createdAt: new Date(),
            avatarUrl: null
        },
        {
            id: 'staff-002',
            email: 'staff2@homebuilder.com',
            fullName: 'Nattaya Designer',
            role: 'staff',
            createdAt: new Date(),
            avatarUrl: null
        },
        {
            id: 'client-001',
            email: 'client1@example.com',
            fullName: 'Anan Sukhum',
            role: 'client',
            createdAt: new Date(),
            avatarUrl: null
        },
        {
            id: 'client-002',
            email: 'client2@example.com',
            fullName: 'Suda Bangkok',
            role: 'client',
            createdAt: new Date(),
            avatarUrl: null
        }
    ];

    // Mock Projects Data
    const mockProjects = [
        {
            projectName: 'Modern Loft House',
            projectCode: 'HBP-2024-001',
            location: 'Sukhumvit 101, Bangkok',
            totalPrice: 8500000,
            status: 'active',
            ownerId: 'client-001',
            assignedStaffIds: ['staff-001', 'staff-002'],
            createdAt: Timestamp.fromDate(new Date('2024-01-15'))
        },
        {
            projectName: 'Tropical Villa',
            projectCode: 'HBP-2024-002',
            location: 'Phuket, Thailand',
            totalPrice: 12000000,
            status: 'active',
            ownerId: 'client-002',
            assignedStaffIds: ['staff-001'],
            createdAt: Timestamp.fromDate(new Date('2024-02-20'))
        },
        {
            projectName: 'Cozy Townhouse',
            projectCode: 'HBP-2024-003',
            location: 'Chiang Mai, Thailand',
            totalPrice: 4500000,
            status: 'active',
            ownerId: 'client-001',
            assignedStaffIds: ['staff-002'],
            createdAt: Timestamp.fromDate(new Date('2024-03-10'))
        }
    ];

    // Create installments for a project
    const createInstallments = (totalPrice) => {
        return [
            {
                sequence: 1,
                title: 'Down Payment (10%)',
                amount: totalPrice * 0.1,
                status: 'paid',
                dueDate: Timestamp.fromDate(new Date('2024-01-20')),
                slipUrl: 'https://via.placeholder.com/400x600/4CAF50/FFFFFF?text=Payment+Slip+1',
                paidAt: Timestamp.fromDate(new Date('2024-01-18'))
            },
            {
                sequence: 2,
                title: 'Foundation Complete (20%)',
                amount: totalPrice * 0.2,
                status: 'paid',
                dueDate: Timestamp.fromDate(new Date('2024-03-01')),
                slipUrl: 'https://via.placeholder.com/400x600/2196F3/FFFFFF?text=Payment+Slip+2',
                paidAt: Timestamp.fromDate(new Date('2024-02-28'))
            },
            {
                sequence: 3,
                title: 'Structure Complete (30%)',
                amount: totalPrice * 0.3,
                status: 'ready_to_pay',
                dueDate: Timestamp.fromDate(new Date('2024-05-15')),
                slipUrl: null,
                paidAt: null
            },
            {
                sequence: 4,
                title: 'Interior Work (25%)',
                amount: totalPrice * 0.25,
                status: 'pending',
                dueDate: Timestamp.fromDate(new Date('2024-07-01')),
                slipUrl: null,
                paidAt: null
            },
            {
                sequence: 5,
                title: 'Final Payment (15%)',
                amount: totalPrice * 0.15,
                status: 'pending',
                dueDate: Timestamp.fromDate(new Date('2024-09-01')),
                slipUrl: null,
                paidAt: null
            }
        ];
    };

    // Create change requests for a project
    const createChangeRequests = (userId) => {
        return [
            {
                title: 'Change floor tiles to premium marble',
                detail: 'Client requested to upgrade from standard ceramic tiles to Italian marble for the living room and kitchen area.',
                type: 'add_order',
                priceImpact: 250000,
                status: 'approved',
                requestedBy: userId,
                createdAt: Timestamp.fromDate(new Date('2024-03-05')),
                images: []
            },
            {
                title: 'Remove guest bedroom balcony',
                detail: 'Client wants to remove the balcony from the second bedroom to increase interior space.',
                type: 'deduct_order',
                priceImpact: 80000,
                status: 'approved',
                requestedBy: userId,
                createdAt: Timestamp.fromDate(new Date('2024-03-12')),
                images: []
            },
            {
                title: 'Note: Parking space orientation',
                detail: 'Please ensure the parking area faces north to avoid direct afternoon sun.',
                type: 'memo',
                priceImpact: 0,
                status: 'draft',
                requestedBy: userId,
                createdAt: Timestamp.fromDate(new Date('2024-04-01')),
                images: []
            },
            {
                title: 'Add smart home system',
                detail: 'Install complete smart home automation including lighting, AC control, and security cameras.',
                type: 'add_order',
                priceImpact: 450000,
                status: 'draft',
                requestedBy: userId,
                createdAt: Timestamp.fromDate(new Date('2024-04-15')),
                images: []
            }
        ];
    };

    const handleSeedData = async () => {
        setLoading(true);
        setSuccess(false);
        setError("");
        setLogs([]);

        try {
            addLog("🌱 Starting mock data seeding...", "info");

            // 1. Add Users
            addLog("👥 Adding mock users...", "info");
            for (const user of mockUsers) {
                await setDoc(doc(db, 'users', user.id), user);
                addLog(`✓ Added user: ${user.fullName} (${user.role})`, "success");
            }

            // 2. Add Projects with subcollections
            addLog("🏗️ Adding mock projects...", "info");
            for (const project of mockProjects) {
                const projectRef = await addDoc(collection(db, 'projects'), project);
                addLog(`✓ Added project: ${project.projectName}`, "success");

                // Add installments
                const installments = createInstallments(project.totalPrice);
                for (const installment of installments) {
                    await addDoc(collection(db, 'projects', projectRef.id, 'installments'), installment);
                }
                addLog(`  ↳ Added ${installments.length} installments`, "info");

                // Add change requests
                const changeRequests = createChangeRequests(project.ownerId);
                for (const cr of changeRequests) {
                    await addDoc(collection(db, 'projects', projectRef.id, 'change_requests'), cr);
                }
                addLog(`  ↳ Added ${changeRequests.length} change requests`, "info");
            }

            addLog("✅ Mock data seeding completed successfully!", "success");
            setSuccess(true);
        } catch (err) {
            console.error("Error seeding data:", err);
            setError(err.message);
            addLog(`❌ Error: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Database className="h-6 w-6" />
                    Seed Mock Data
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Populate Firestore with sample data for testing
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Mock Data Summary</CardTitle>
                    <CardDescription>This will create the following data in Firestore:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">5</p>
                            <p className="text-sm text-gray-600">Users</p>
                            <p className="text-xs text-gray-500">1 Admin, 2 Staff, 2 Clients</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">3</p>
                            <p className="text-sm text-gray-600">Projects</p>
                            <p className="text-xs text-gray-500">With full details</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">15</p>
                            <p className="text-sm text-gray-600">Installments</p>
                            <p className="text-xs text-gray-500">5 per project</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">12</p>
                            <p className="text-sm text-gray-600">Change Requests</p>
                            <p className="text-xs text-gray-500">4 per project</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Test Credentials:</h4>
                        <div className="space-y-1 text-sm">
                            <p><Badge variant="outline">Admin</Badge> admin@homebuilder.com</p>
                            <p><Badge variant="outline">Staff</Badge> staff1@homebuilder.com / staff2@homebuilder.com</p>
                            <p><Badge variant="outline">Client</Badge> client1@example.com / client2@example.com</p>
                        </div>
                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                            ⚠️ Note: You need to create these users in Firebase Authentication manually!
                        </p>
                    </div>

                    <Button
                        onClick={handleSeedData}
                        disabled={loading || success}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Seeding Data...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Data Seeded Successfully
                            </>
                        ) : (
                            <>
                                <Database className="mr-2 h-4 w-4" />
                                Seed Mock Data
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800">Error</p>
                                <p className="text-xs text-red-600">{error}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {logs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Execution Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
                            {logs.map((log, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="text-gray-500">[{log.time}]</span>
                                    <span className={
                                        log.type === 'error' ? 'text-red-400' :
                                        log.type === 'success' ? 'text-green-400' :
                                        'text-gray-300'
                                    }>
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
