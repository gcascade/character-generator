import React from 'react';
import { Navigate, RouteObject } from 'react-router';
import Characters from './pages/characters/Characters';
import Home from './pages/home/Home';
import Settings from './pages/settings/Settings';

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/characters', element: <Characters /> },
  { path: '/settings', element: <Settings /> },
  { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
