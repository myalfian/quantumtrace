import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProjectList from './Project/ProjectList';
import ProjectDetails from './Project/ProjectDetails';

export default function ProjectTracking() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Project Tracking</h1>
      
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/:id" element={<ProjectDetails />} />
      </Routes>
    </div>
  );
}