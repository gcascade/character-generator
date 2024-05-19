import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';

const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/character-generator" replace /> },
  { path: '/character-generator', element: <Home /> },
  { path: '/settings', element: <Settings /> },
];

export default routes;
