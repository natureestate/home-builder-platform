/**
 * Mock Data Seeding Script for Home Builder Platform
 *
 * This script populates Firestore with sample data for testing.
 * Run with: node scripts/seed-mockup-data.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    fullName: 'SomchaiBuilder',
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

// Function to create installments for a project
function createInstallments(projectId, totalPrice) {
  const installments = [
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

  return installments;
}

// Function to create change requests for a project
function createChangeRequests(userId) {
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
}

// Main seeding function
async function seedData() {
  try {
    console.log('🌱 Starting mock data seeding...\n');

    // 1. Add Users
    console.log('👥 Adding mock users...');
    for (const user of mockUsers) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`   ✓ Added user: ${user.fullName} (${user.role})`);
    }
    console.log('');

    // 2. Add Projects with subcollections
    console.log('🏗️  Adding mock projects...');
    for (let i = 0; i < mockProjects.length; i++) {
      const project = mockProjects[i];
      const projectRef = await addDoc(collection(db, 'projects'), project);
      console.log(`   ✓ Added project: ${project.projectName} (${project.projectCode})`);

      // Add installments for this project
      const installments = createInstallments(projectRef.id, project.totalPrice);
      for (const installment of installments) {
        await addDoc(collection(db, 'projects', projectRef.id, 'installments'), installment);
      }
      console.log(`     ↳ Added ${installments.length} installments`);

      // Add change requests for this project
      const changeRequests = createChangeRequests(project.ownerId);
      for (const cr of changeRequests) {
        await addDoc(collection(db, 'projects', projectRef.id, 'change_requests'), cr);
      }
      console.log(`     ↳ Added ${changeRequests.length} change requests`);
    }
    console.log('');

    console.log('✅ Mock data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${mockUsers.length}`);
    console.log(`   - Projects: ${mockProjects.length}`);
    console.log(`   - Installments per project: 5`);
    console.log(`   - Change requests per project: 4`);
    console.log('\n💡 You can now use these credentials to test:');
    console.log('   Admin: admin@homebuilder.com');
    console.log('   Staff: staff1@homebuilder.com / staff2@homebuilder.com');
    console.log('   Client: client1@example.com / client2@example.com');
    console.log('\n⚠️  Note: You need to create these users in Firebase Authentication first!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding
seedData();
