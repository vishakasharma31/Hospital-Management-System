import React from 'react';
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react';

const PrivacyBadge = ({ level }) => {
  if (level === 'Restricted') {
    return (
      <span className="badge badge-danger" title="Restricted Access - High Security Confidential">
        <ShieldAlert size={12} /> RESTRICTED ACCESS
      </span>
    );
  }
  if (level === 'Confidential') {
    return (
      <span className="badge badge-warning" title="Confidential Medical File - Doctor Access Only">
        <Lock size={12} /> CONFIDENTIAL
      </span>
    );
  }
  return (
    <span className="badge badge-success" title="Standard Hospital Clearance Record">
      <ShieldCheck size={12} /> STANDARD
    </span>
  );
};

export default PrivacyBadge;
