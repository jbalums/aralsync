import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import SignIn from './pages/SignIn.jsx';
import AppShell from './AppShell.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/app/*" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
