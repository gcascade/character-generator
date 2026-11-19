import React from 'react';
import { Navigate, RouteObject } from 'react-router';
import CharacterDetails from './pages/characterDetails/CharacterDetails';
import Characters from './pages/characters/Characters';
import Home from './pages/home/Home';
import Party from './pages/party/Party';
import Settings from './pages/settings/Settings';

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/characters', element: <Characters /> },
  { path: '/characters/:id', element: <CharacterDetails /> },
  { path: '/party', element: <Party /> },
  { path: '/settings', element: <Settings /> },
  { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
