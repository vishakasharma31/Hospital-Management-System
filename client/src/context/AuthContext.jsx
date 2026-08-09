import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEMO_USERS = {
  Admin: {
    id: 'user-admin-1',
    username: 'admin',
    name: 'Alex Rivera',
    email: 'alex.rivera@stjudehospital.org',
    role: 'Admin',
    department: 'Hospital Administration',
    privacyClearance: 'High',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  Doctor: {
    id: 'user-doc-1',
    username: 'dr_jenkins',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@stjudehospital.org',
    role: 'Doctor',
    department: 'Cardiology',
    specialization: 'Cardiovascular Surgery',
    privacyClearance: 'High',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
  },
  Staff: {
    id: 'user-staff-1',
    username: 'receptionist',
    name: 'Nurse Mark Vance',
    email: 'mark.vance@stjudehospital.org',
    role: 'Staff',
    department: 'Front Desk / Admissions',
    privacyClearance: 'Standard',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
  },
  Patient: {
    id: 'user-pat-1',
    username: 'john_doe',
    name: 'John Doe',
    email: 'john.doe@email.com',
    role: 'Patient',
    department: 'Outpatient',
    privacyClearance: 'PersonalOnly',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mis_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.Admin;
  });

  const [token, setToken] = useState(() => localStorage.getItem('mis_token') || 'demo-jwt-token');

  useEffect(() => {
    if (user) {
      localStorage.setItem('mis_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mis_user');
    }
  }, [user]);

  const switchRole = (newRole) => {
    if (DEMO_USERS[newRole]) {
      setUser(DEMO_USERS[newRole]);
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken || 'demo-jwt-token');
    if (userToken) localStorage.setItem('mis_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mis_user');
    localStorage.removeItem('mis_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
