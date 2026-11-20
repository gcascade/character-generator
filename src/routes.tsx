import React from 'react';
import { Navigate, RouteObject } from 'react-router';
import CharacterDetails from './pages/characterDetails/CharacterDetails';
import Characters from './pages/characters/Characters';
import Home from './pages/home/Home';
import NpcDetails from './pages/npcDetails/NpcDetails';
import Npcs from './pages/npcs/Npcs';
import Party from './pages/party/Party';
import Settings from './pages/settings/Settings';
import Share from './pages/share/Share';

const routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/characters', element: <Characters /> },
  { path: '/characters/:id', element: <CharacterDetails /> },
  { path: '/party', element: <Party /> },
  { path: '/npcs', element: <Npcs /> },
  { path: '/npcs/:id', element: <NpcDetails /> },
  { path: '/settings', element: <Settings /> },
  { path: '/share', element: <Share /> },
  { path: '*', element: <Navigate to="/" replace /> },
];

export default routes;
