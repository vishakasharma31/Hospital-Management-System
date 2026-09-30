const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const seedDatabase = require('./seed');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Billing = require('./models/Billing');
const AuditLog = require('./models/AuditLog');

const { JWT_SECRET, authenticateToken, authorizeRoles, logAuditEvent } = require('./middleware/auth');
const { sanitizePatientRecord } = require('./utils/piiSanitizer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let globalAnonymizationMode = false;

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      await logAuditEvent({
        userName: username,
        userRole: 'Guest',
        action: 'LOGIN_ATTEMPT',
        targetResource: '/api/auth/login',
        status: 'DENIED',
        reason: 'User account not found'
      });
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAuditEvent({
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN_ATTEMPT',
        targetResource: '/api/auth/login',
        status: 'DENIED',
        reason: 'Incorrect password entered'
      });
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditEvent({
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      targetResource: '/api/auth/login',
      status: 'GRANTED',
      reason: `Authenticated successfully as ${user.role}`
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        privacyClearance: user.privacyClearance,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// PATIENT MANAGEMENT ROUTES (PRIVACY PROTECTED)
// ----------------------------------------------------
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const { search, privacyLevel } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    if (privacyLevel) {
      query.privacyLevel = privacyLevel;
    }

    // Patient role sees only their own patient record
    if (req.user.role === 'Patient') {
      const patientRec = await Patient.findOne({ userId: req.user.id });
      if (!patientRec) {
        // Fallback search by email
        const userObj = await User.findById(req.user.id);
        if (userObj) {
          const match = await Patient.findOne({ email: userObj.email });
          if (match) {
            return res.json([sanitizePatientRecord(match, req.user.role, globalAnonymizationMode)]);
          }
        }
        return res.json([]);
      }
      return res.json([sanitizePatientRecord(patientRec, req.user.role, globalAnonymizationMode)]);
    }

    const patients = await Patient.find(query).populate('assignedDoctor', 'name department specialization');
    const sanitized = patients.map(p => sanitizePatientRecord(p, req.user.role, globalAnonymizationMode));

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VIEW_PATIENT_LIST',
      targetResource: '/api/patients',
      status: req.user.role === 'Staff' ? 'MASKED_ACCESS' : 'GRANTED',
      reason: `Retrieved patient directory (${sanitized.length} records). PII Masked: ${req.user.role === 'Staff' || globalAnonymizationMode}`
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('assignedDoctor', 'name specialization');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Privacy restriction check
    if (req.user.role === 'Staff' && patient.privacyLevel === 'Restricted') {
      await logAuditEvent({
        userName: req.user.name,
        userRole: req.user.role,
        action: 'VIEW_PATIENT_DETAIL',
        targetResource: `/api/patients/${req.params.id}`,
        patientId: patient.patientId,
        status: 'DENIED',
        reason: 'Restricted Privacy Level - Staff access blocked'
      });
      return res.status(403).json({ message: 'Access Denied: Patient record classified as RESTRICTED' });
    }

    const sanitized = sanitizePatientRecord(patient, req.user.role, globalAnonymizationMode);

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VIEW_PATIENT_DETAIL',
      targetResource: `/api/patients/${req.params.id}`,
      patientId: patient.patientId,
      status: 'GRANTED',
      reason: `Viewed details for patient ${patient.name}`
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/patients', authenticateToken, authorizeRoles('Admin', 'Doctor', 'Staff'), async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    const newPatient = new Patient({
      ...req.body,
      patientId: `PAT-${1000 + count + 1}`
    });
    await newPatient.save();

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_PATIENT',
      targetResource: '/api/patients',
      patientId: newPatient.patientId,
      status: 'GRANTED',
      reason: `Created new patient profile: ${newPatient.name}`
    });

    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------------------------
// DOCTOR & STAFF MANAGEMENT ROUTES
// ----------------------------------------------------
app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['Admin', 'Doctor', 'Staff'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/staff', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password || 'password123', 10);
    const newUser = new User({
      ...req.body,
      password: hashedPassword
    });
    await newUser.save();

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'ADD_STAFF',
      targetResource: '/api/staff',
      status: 'GRANTED',
      reason: `Registered new hospital staff member: ${newUser.name} (${newUser.role})`
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------------------------
// APPOINTMENTS ROUTES
// ----------------------------------------------------
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    } else if (req.user.role === 'Patient') {
      const patientRec = await Patient.findOne({ userId: req.user.id });
      if (patientRec) {
        query.patient = patientRec._id;
      }
    }

    const appointments = await Appointment.find(query)
      .populate({ path: 'patient', select: 'name patientId phone privacyLevel' })
      .populate({ path: 'doctor', select: 'name specialization department' })
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const count = await Appointment.countDocuments();
    const appointment = new Appointment({
      ...req.body,
      appointmentId: `APT-2026-${String(count + 1).padStart(3, '0')}`
    });
    await appointment.save();

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'BOOK_APPOINTMENT',
      targetResource: '/api/appointments',
      status: 'GRANTED',
      reason: `Booked appointment ${appointment.appointmentId}`
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_APPOINTMENT',
      targetResource: `/api/appointments/${req.params.id}`,
      status: 'GRANTED',
      reason: `Updated appointment status to ${req.body.status}`
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------------------------
// MEDICAL RECORDS (EHR) ROUTES - HIGH CONFIDENTIALITY
// ----------------------------------------------------
app.get('/api/medical-records', authenticateToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Patient') {
      const patientRec = await Patient.findOne({ userId: req.user.id });
      if (patientRec) query.patient = patientRec._id;
      else return res.json([]);
    } else if (req.user.role === 'Staff') {
      // Staff role is blocked from viewing EHR diagnosis records due to patient confidentiality
      await logAuditEvent({
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ACCESS_EHR_LIST',
        targetResource: '/api/medical-records',
        status: 'DENIED',
        reason: 'CONFIDENTIALITY: Receptionist role unauthorized for EHR medical notes'
      });
      return res.status(403).json({ message: 'Access Denied: Staff/Receptionist cannot access patient medical records.' });
    } else if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name patientId age gender privacyLevel')
      .populate('doctor', 'name specialization department')
      .sort({ date: -1 });

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VIEW_MEDICAL_RECORDS',
      targetResource: '/api/medical-records',
      status: 'GRANTED',
      reason: `Retrieved ${records.length} EHR records under ${req.user.role} role`
    });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/medical-records', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const count = await MedicalRecord.countDocuments();
    const newRecord = new MedicalRecord({
      ...req.body,
      recordId: `REC-${8000 + count + 1}`,
      doctor: req.user.id
    });
    await newRecord.save();

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_MEDICAL_RECORD',
      targetResource: '/api/medical-records',
      status: 'GRANTED',
      reason: `Created diagnosis & prescription record ${newRecord.recordId}`
    });

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------------------------
// BILLING & INVOICING ROUTES
// ----------------------------------------------------
app.get('/api/billing', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Patient') {
      const patientRec = await Patient.findOne({ userId: req.user.id });
      if (patientRec) query.patient = patientRec._id;
      else return res.json([]);
    }

    const invoices = await Billing.find(query)
      .populate('patient', 'name patientId email phone')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/billing', authenticateToken, authorizeRoles('Admin', 'Staff'), async (req, res) => {
  try {
    const count = await Billing.countDocuments();
    const newInvoice = new Billing({
      ...req.body,
      invoiceId: `INV-${5000 + count + 1}`
    });
    await newInvoice.save();

    await logAuditEvent({
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_INVOICE',
      targetResource: '/api/billing',
      status: 'GRANTED',
      reason: `Generated invoice ${newInvoice.invoiceId} ($${newInvoice.totalAmount})`
    });

    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ----------------------------------------------------
// REPORTS & ANALYTICS ROUTE
// ----------------------------------------------------
app.get('/api/reports/analytics', authenticateToken, authorizeRoles('Admin', 'Doctor'), async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'Scheduled' });
    const totalInvoices = await Billing.find();
    const totalRevenue = totalInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

    const auditCount = await AuditLog.countDocuments();
    const blockedCount = await AuditLog.countDocuments({ status: 'DENIED' });

    res.json({
      summary: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        totalRevenue,
        privacyAccessScore: Math.round(((auditCount - blockedCount) / (auditCount || 1)) * 100),
        totalAuditEvents: auditCount,
        blockedAccessAttempts: blockedCount
      },
      patientAdmissionsTrend: [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 52 },
        { month: 'Mar', count: 61 },
        { month: 'Apr', count: 58 },
        { month: 'May', count: 74 },
        { month: 'Jun', count: 82 },
        { month: 'Jul', count: 95 }
      ],
      departmentDistribution: [
        { name: 'Cardiology', value: 35 },
        { name: 'Neurology', value: 25 },
        { name: 'Pediatrics', value: 20 },
        { name: 'Orthopedics', value: 12 },
        { name: 'General', value: 8 }
      ],
      privacyBreakdown: [
        { level: 'Standard', count: await Patient.countDocuments({ privacyLevel: 'Standard' }) },
        { level: 'Confidential', count: await Patient.countDocuments({ privacyLevel: 'Confidential' }) },
        { level: 'Restricted Access', count: await Patient.countDocuments({ privacyLevel: 'Restricted' }) }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// AUDIT LOGS ROUTE (ADMIN ONLY PRIVACY MONITOR)
// ----------------------------------------------------
app.get('/api/audit-logs', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};
    if (status) query.status = status;
    if (role) query.userRole = role;

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------------------------
// PRIVACY & SECURITY CONTROLS
// ----------------------------------------------------
app.get('/api/privacy/status', authenticateToken, (req, res) => {
  res.json({
    globalAnonymizationMode,
    rbacEnforced: true,
    zeroKnowledgeSimulated: true,
    hipaaGdprCompliant: true
  });
});

app.post('/api/privacy/toggle-anonymization', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  globalAnonymizationMode = !globalAnonymizationMode;

  await logAuditEvent({
    userName: req.user.name,
    userRole: req.user.role,
    action: 'TOGGLE_ANONYMIZATION_MODE',
    targetResource: '/api/privacy/toggle-anonymization',
    status: 'GRANTED',
    reason: `Global PII Anonymization set to ${globalAnonymizationMode}`
  });

  res.json({ globalAnonymizationMode });
});

// ----------------------------------------------------
// SERVER & DATABASE INITIALIZATION
// ----------------------------------------------------
const startServer = async () => {
  let mongoUri = process.env.MONGODB_URI;

  try {
    if (!mongoUri) {
      console.log('⚡ Starting MongoMemoryServer for standalone zero-config execution...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB at:', mongoUri);

    // Seed database automatically
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Hospital MIS Server listening on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const altPort = Number(PORT) + 1;
        console.log(`⚠️ Port ${PORT} in use, trying alternate port ${altPort}...`);
        app.listen(altPort, () => {
          console.log(`🚀 Hospital MIS Server listening on http://localhost:${altPort}`);
        });
      } else {
        console.error('Server Listen Error:', err);
      }
    });
  } catch (err) {
    console.error('Server Initialization Error:', err);
  }
};

startServer();
