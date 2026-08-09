import React, { createContext, useContext, useState } from 'react';

const PrivacyContext = createContext();

export const PrivacyProvider = ({ children }) => {
  const [globalAnonymization, setGlobalAnonymization] = useState(false);
  const [hipaaCompliance, setHipaaCompliance] = useState(true);
  const [auditLogAlerts, setAuditLogAlerts] = useState([]);

  const toggleAnonymization = () => {
    setGlobalAnonymization(prev => !prev);
  };

  const maskSSN = (ssn) => {
    if (!ssn) return '•••-••-••••';
    const clean = String(ssn).replace(/[^0-9]/g, '');
    if (clean.length < 4) return '•••-••-••••';
    return `•••-••-${clean.slice(-4)}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return '••••••••••';
    const clean = String(phone).replace(/[^0-9]/g, '');
    if (clean.length < 4) return '••••••••••';
    return `+1 (•••) •••-${clean.slice(-4)}`;
  };

  const maskAddress = (address) => {
    if (!address) return '[REDACTED RESIDENCE]';
    const parts = String(address).split(',');
    if (parts.length > 1) {
      return `[PROTECTED STREET], ${parts[parts.length - 1].trim()}`;
    }
    return '[CONFIDENTIAL LOCATION]';
  };

  const canAccessMedicalHistory = (userRole, patientPrivacyLevel) => {
    if (userRole === 'Admin' || userRole === 'Doctor') return true;
    if (userRole === 'Patient') return true; // Patient views their own
    return false; // Receptionist/Staff blocked from diagnosis/EHR
  };

  return (
    <PrivacyContext.Provider value={{
      globalAnonymization,
      toggleAnonymization,
      hipaaCompliance,
      maskSSN,
      maskPhone,
      maskAddress,
      canAccessMedicalHistory
    }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
