import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import Characters from './pages/characters/Characters';
import Home from './pages/home/Home';
import Settings from './pages/settings/Settings';

const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/character-generator" replace /> },
  { path: '/character-generator', element: <Home /> },
  { path: '/characters', element: <Characters /> },
  { path: '/settings', element: <Settings /> },
];

export default routes;
