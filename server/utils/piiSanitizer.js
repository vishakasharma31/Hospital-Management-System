/**
 * Helper to mask PII (Personally Identifiable Information) based on role and privacy level
 */

const maskSSN = (ssn) => {
  if (!ssn) return '•••-••-••••';
  const clean = ssn.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '•••-••-••••';
  return `•••-••-${clean.slice(-4)}`;
};

const maskPhone = (phone) => {
  if (!phone) return '••••••••••';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '••••••••••';
  return `+1 (•••) •••-${clean.slice(-4)}`;
};

const maskAddress = (address) => {
  if (!address) return '[REDACTED ADDRESS]';
  const parts = address.split(',');
  if (parts.length > 1) {
    return `[CONFIDENTIAL STREET], ${parts[parts.length - 1].trim()}`;
  }
  return '[PROTECTED RESIDENTIAL LOCATION]';
};

const sanitizePatientRecord = (patientObj, userRole, globalAnonymize = false) => {
  const patient = JSON.parse(JSON.stringify(patientObj));

  // Admin, Doctor, or the patient themselves have unmasked view if not global anonymized
  const isAuthorizedFullView = (userRole === 'Admin' || userRole === 'Doctor') && !globalAnonymize;

  if (!isAuthorizedFullView) {
    patient.ssn = maskSSN(patient.ssn);
    patient.phone = maskPhone(patient.phone);
    patient.address = maskAddress(patient.address);
    patient.emergencyContact = maskPhone(patient.emergencyContact);

    // If Receptionist/Staff and patient has Confidential/Restricted privacy level, hide medical summary
    if (userRole === 'Staff' && patient.privacyLevel !== 'Standard') {
      patient.medicalHistorySummary = '[CONFIDENTIAL MEDICAL HISTORY - DOCTOR CLEARANCE REQUIRED]';
    }
  }

  return patient;
};

module.exports = {
  maskSSN,
  maskPhone,
  maskAddress,
  sanitizePatientRecord
};
