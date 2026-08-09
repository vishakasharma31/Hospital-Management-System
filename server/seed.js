const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Billing = require('./models/Billing');
const AuditLog = require('./models/AuditLog');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Database Seeding...');

    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Billing.deleteMany({});
    await AuditLog.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const users = await User.insertMany([
      {
        username: 'admin',
        password: hashedPassword,
        name: 'Alex Rivera',
        email: 'alex.rivera@stjudehospital.org',
        role: 'Admin',
        department: 'Hospital Administration',
        privacyClearance: 'High',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        username: 'dr_jenkins',
        password: hashedPassword,
        name: 'Dr. Sarah Jenkins',
        email: 's.jenkins@stjudehospital.org',
        role: 'Doctor',
        department: 'Cardiology',
        specialization: 'Cardiovascular Surgery',
        privacyClearance: 'High',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
      },
      {
        username: 'dr_chen',
        password: hashedPassword,
        name: 'Dr. Robert Chen',
        email: 'r.chen@stjudehospital.org',
        role: 'Doctor',
        department: 'Neurology',
        specialization: 'Neuro-Oncology',
        privacyClearance: 'High',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
      },
      {
        username: 'dr_davis',
        password: hashedPassword,
        name: 'Dr. Emily Davis',
        email: 'e.davis@stjudehospital.org',
        role: 'Doctor',
        department: 'Pediatrics',
        specialization: 'Pediatric Care',
        privacyClearance: 'High',
        avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=150'
      },
      {
        username: 'receptionist',
        password: hashedPassword,
        name: 'Nurse Mark Vance',
        email: 'mark.vance@stjudehospital.org',
        role: 'Staff',
        department: 'Front Desk / Admissions',
        privacyClearance: 'Standard',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
      },
      {
        username: 'john_doe',
        password: hashedPassword,
        name: 'John Doe',
        email: 'john.doe@email.com',
        role: 'Patient',
        department: 'Outpatient',
        privacyClearance: 'PersonalOnly',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ]);

    const doctorJenkins = users.find(u => u.username === 'dr_jenkins');
    const doctorChen = users.find(u => u.username === 'dr_chen');
    const doctorDavis = users.find(u => u.username === 'dr_davis');
    const patientUser = users.find(u => u.username === 'john_doe');

    // Create Patients
    const patients = await Patient.insertMany([
      {
        patientId: 'PAT-1001',
        name: 'John Doe',
        age: 42,
        gender: 'Male',
        bloodGroup: 'O+',
        ssn: '123-45-6789',
        phone: '+1 (555) 234-5678',
        email: 'john.doe@email.com',
        address: '742 Evergreen Terrace, Springfield, OR',
        emergencyContact: '+1 (555) 987-6543',
        assignedDoctor: doctorJenkins._id,
        privacyLevel: 'Standard',
        consentForResearch: true,
        medicalHistorySummary: 'History of Mild Hypertension, Seasonal Allergies',
        userId: patientUser._id
      },
      {
        patientId: 'PAT-1002',
        name: 'Eleanor Vance',
        age: 68,
        gender: 'Female',
        bloodGroup: 'A-',
        ssn: '987-65-4321',
        phone: '+1 (555) 345-6789',
        email: 'eleanor.vance@email.com',
        address: '128 Hill House Lane, Boston, MA',
        emergencyContact: '+1 (555) 876-5432',
        assignedDoctor: doctorChen._id,
        privacyLevel: 'Confidential',
        consentForResearch: false,
        medicalHistorySummary: 'Early-stage Parkinson tremor monitoring'
      },
      {
        patientId: 'PAT-1003',
        name: 'Marcus Brody',
        age: 29,
        gender: 'Male',
        bloodGroup: 'B+',
        ssn: '456-78-9012',
        phone: '+1 (555) 456-7890',
        email: 'm.brody@museum.org',
        address: '42 Archeology Way, New York, NY',
        emergencyContact: '+1 (555) 765-4321',
        assignedDoctor: doctorJenkins._id,
        privacyLevel: 'Restricted',
        consentForResearch: false,
        medicalHistorySummary: 'Post-operative Cardiac Valve Replacement follow-up'
      },
      {
        patientId: 'PAT-1004',
        name: 'Sophia Martinez',
        age: 8,
        gender: 'Female',
        bloodGroup: 'AB+',
        ssn: '321-65-9874',
        phone: '+1 (555) 567-8901',
        email: 'parent.martinez@email.com',
        address: '89 Maple Street, Seattle, WA',
        emergencyContact: '+1 (555) 654-3210',
        assignedDoctor: doctorDavis._id,
        privacyLevel: 'Standard',
        consentForResearch: true,
        medicalHistorySummary: 'Asthma Management Plan'
      },
      {
        patientId: 'PAT-1005',
        name: 'Harrison Sterling',
        age: 55,
        gender: 'Male',
        bloodGroup: 'O-',
        ssn: '654-32-1987',
        phone: '+1 (555) 678-9012',
        email: 'h.sterling@corporate.com',
        address: '100 Financial Blvd, Chicago, IL',
        emergencyContact: '+1 (555) 543-2109',
        assignedDoctor: doctorChen._id,
        privacyLevel: 'Confidential',
        consentForResearch: false,
        medicalHistorySummary: 'Executive VIP - Chronic Migraines'
      }
    ]);

    const patientJohn = patients.find(p => p.patientId === 'PAT-1001');
    const patientEleanor = patients.find(p => p.patientId === 'PAT-1002');
    const patientMarcus = patients.find(p => p.patientId === 'PAT-1003');
    const patientSophia = patients.find(p => p.patientId === 'PAT-1004');

    // Create Appointments
    await Appointment.insertMany([
      {
        appointmentId: 'APT-2026-001',
        patient: patientJohn._id,
        doctor: doctorJenkins._id,
        date: '2026-08-12',
        time: '10:00 AM',
        department: 'Cardiology',
        type: 'Routine Checkup',
        status: 'Scheduled',
        reason: 'Quarterly Blood Pressure Evaluation',
        notes: 'Patient requested morning slot'
      },
      {
        appointmentId: 'APT-2026-002',
        patient: patientEleanor._id,
        doctor: doctorChen._id,
        date: '2026-08-12',
        time: '11:30 AM',
        department: 'Neurology',
        type: 'Consultation',
        status: 'Scheduled',
        reason: 'Tremor assessment & MRI review'
      },
      {
        appointmentId: 'APT-2026-003',
        patient: patientMarcus._id,
        doctor: doctorJenkins._id,
        date: '2026-08-10',
        time: '02:00 PM',
        department: 'Cardiology',
        type: 'Follow-up',
        status: 'Completed',
        reason: 'Post-op Echocardiogram Check'
      },
      {
        appointmentId: 'APT-2026-004',
        patient: patientSophia._id,
        doctor: doctorDavis._id,
        date: '2026-08-14',
        time: '09:15 AM',
        department: 'Pediatrics',
        type: 'Consultation',
        status: 'Scheduled',
        reason: 'Seasonal Asthma inhaler prescription renewal'
      }
    ]);

    // Create Medical Records
    await MedicalRecord.insertMany([
      {
        recordId: 'REC-8001',
        patient: patientJohn._id,
        doctor: doctorJenkins._id,
        diagnosis: 'Essential (Primary) Hypertension',
        symptoms: ['Mild dizziness during morning', 'Occasional elevated heart rate'],
        treatmentPlan: 'Maintain low-sodium diet, regular aerobic exercise 30 min daily.',
        prescriptions: [
          { medicine: 'Lisinopril', dosage: '10mg', frequency: 'Once daily (Morning)', duration: '90 days' },
          { medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (Evening)', duration: '90 days' }
        ],
        labResults: {
          testName: 'Lipid Panel & Serum Electrolytes',
          resultSummary: 'Cholesterol: 195 mg/dL (Normal). Triglycerides: 140 mg/dL.',
          status: 'Normal'
        },
        privacyClassification: 'Internal-Doctor-Only',
        date: '2026-07-20'
      },
      {
        recordId: 'REC-8002',
        patient: patientEleanor._id,
        doctor: doctorChen._id,
        diagnosis: 'Essential Tremor / Early Neurological Evaluation',
        symptoms: ['Bilateral hand tremor during action', 'Mild insomnia'],
        treatmentPlan: 'Physical therapy exercises and motor coordination checkup in 4 weeks.',
        prescriptions: [
          { medicine: 'Propranolol', dosage: '20mg', frequency: 'Twice daily', duration: '30 days' }
        ],
        labResults: {
          testName: 'Brain MRI Scanner Report',
          resultSummary: 'No acute intracranial pathology. Normal age-related changes.',
          status: 'Normal'
        },
        privacyClassification: 'High-Security-Confidential',
        date: '2026-08-01'
      },
      {
        recordId: 'REC-8003',
        patient: patientMarcus._id,
        doctor: doctorJenkins._id,
        diagnosis: 'Aortic Valve Repair Recovery',
        symptoms: ['Slight incisional discomfort'],
        treatmentPlan: 'Continue cardiac rehabilitation stage 2.',
        prescriptions: [
          { medicine: 'Warfarin', dosage: '5mg', frequency: 'As directed', duration: '60 days' }
        ],
        labResults: {
          testName: 'INR Blood Coagulation Test',
          resultSummary: 'INR value 2.4 (Target therapeutic range 2.0-3.0).',
          status: 'Normal'
        },
        privacyClassification: 'High-Security-Confidential',
        date: '2026-08-10'
      }
    ]);

    // Create Billing Invoices
    await Billing.insertMany([
      {
        invoiceId: 'INV-5001',
        patient: patientJohn._id,
        items: [
          { description: 'Cardiology Consultation Fee', cost: 150 },
          { description: 'ECG Electrocardiogram Diagnostics', cost: 250 },
          { description: 'Laboratory Blood Work', cost: 120 }
        ],
        totalAmount: 520,
        discountAmount: 20,
        insuranceClaimed: true,
        insuranceAmountCovered: 400,
        amountPaid: 100,
        paymentStatus: 'Paid',
        dueDate: '2026-08-30'
      },
      {
        invoiceId: 'INV-5002',
        patient: patientEleanor._id,
        items: [
          { description: 'Neurology Specialist Consultation', cost: 220 },
          { description: 'Brain MRI Imaging Scan', cost: 1100 },
          { description: 'EEG Neurological Diagnostics', cost: 350 }
        ],
        totalAmount: 1670,
        discountAmount: 70,
        insuranceClaimed: true,
        insuranceAmountCovered: 1300,
        amountPaid: 0,
        paymentStatus: 'Pending',
        dueDate: '2026-09-15'
      },
      {
        invoiceId: 'INV-5003',
        patient: patientMarcus._id,
        items: [
          { description: 'Cardiac Follow-up & Echocardiogram', cost: 450 },
          { description: 'INR Lab Testing', cost: 80 }
        ],
        totalAmount: 530,
        discountAmount: 30,
        insuranceClaimed: false,
        insuranceAmountCovered: 0,
        amountPaid: 500,
        paymentStatus: 'Paid',
        dueDate: '2026-08-25'
      }
    ]);

    // Create Audit Logs
    await AuditLog.insertMany([
      {
        logId: 'LOG-9901',
        userName: 'Alex Rivera',
        userRole: 'Admin',
        action: 'SYSTEM_CONFIG',
        targetResource: '/api/privacy/settings',
        status: 'GRANTED',
        reason: 'Enforced High-Security Differential Privacy Rules',
        ipAddress: '192.168.1.10',
        timestamp: new Date(Date.now() - 3600000 * 24)
      },
      {
        logId: 'LOG-9902',
        userName: 'Dr. Sarah Jenkins',
        userRole: 'Doctor',
        action: 'VIEW_EHR',
        targetResource: '/api/medical-records/REC-8001',
        patientId: 'PAT-1001',
        status: 'GRANTED',
        reason: 'Authorized Physician Access for John Doe',
        ipAddress: '192.168.1.45',
        timestamp: new Date(Date.now() - 3600000 * 12)
      },
      {
        logId: 'LOG-9903',
        userName: 'Nurse Mark Vance',
        userRole: 'Staff',
        action: 'VIEW_PATIENT_PII',
        targetResource: '/api/patients/PAT-1002',
        patientId: 'PAT-1002',
        status: 'MASKED_ACCESS',
        reason: 'Receptionist role: SSN & Phone auto-masked by Privacy Shield',
        ipAddress: '192.168.1.102',
        timestamp: new Date(Date.now() - 3600000 * 6)
      },
      {
        logId: 'LOG-9904',
        userName: 'Nurse Mark Vance',
        userRole: 'Staff',
        action: 'ACCESS_ATTEMPT',
        targetResource: '/api/medical-records/REC-8002',
        patientId: 'PAT-1002',
        status: 'DENIED',
        reason: 'BLOCKED: Staff role does not have clearance for High-Security EHR',
        ipAddress: '192.168.1.102',
        timestamp: new Date(Date.now() - 3600000 * 2)
      },
      {
        logId: 'LOG-9905',
        userName: 'John Doe',
        userRole: 'Patient',
        action: 'VIEW_MY_PORTAL',
        targetResource: '/api/patient/dashboard',
        patientId: 'PAT-1001',
        status: 'GRANTED',
        reason: 'Patient self-service portal access granted',
        ipAddress: '172.56.21.9',
        timestamp: new Date(Date.now() - 1800000)
      }
    ]);

    console.log('✅ Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding Error:', err);
  }
};

module.exports = seedDatabase;

if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_mis_db';
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('MongoDB Connection Failed:', err.message);
      process.exit(1);
    });
}
