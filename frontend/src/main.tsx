import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './app/router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-surface text-muted text-sm">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
);
