import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentCreate from './pages/DocumentCreate';
import DocumentDetail from './pages/DocumentDetail';
import Assignments from './pages/Assignments';
import Statistics from './pages/Statistics';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Users from './pages/Users';
import TemplateList from './pages/templates/TemplateList';
import TemplateEditor from './pages/templates/TemplateEditor';
import CreateFromTemplate from './pages/templates/CreateFromTemplate';
import ReportGenerator from './pages/ReportGenerator';
import PredictDashboard from './pages/PredictDashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout><Dashboard /></Layout>
            </PrivateRoute>
          } />

          <Route path="/documents" element={
            <PrivateRoute>
              <Layout><Documents /></Layout>
            </PrivateRoute>
          } />

          <Route path="/documents/new" element={
            <PrivateRoute>
              <Layout><DocumentCreate /></Layout>
            </PrivateRoute>
          } />

          <Route path="/documents/:id" element={
            <PrivateRoute>
              <Layout><DocumentDetail /></Layout>
            </PrivateRoute>
          } />

          <Route path="/assignments" element={
            <PrivateRoute>
              <Layout><Assignments /></Layout>
            </PrivateRoute>
          } />

          <Route path="/statistics" element={
            <PrivateRoute>
              <Layout><Statistics /></Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics" element={
            <PrivateRoute>
              <Layout><AnalyticsDashboard /></Layout>
            </PrivateRoute>
          } />

          <Route path="/templates" element={
            <PrivateRoute>
              <Layout><TemplateList /></Layout>
            </PrivateRoute>
          } />

          <Route path="/templates/new" element={
            <PrivateRoute>
              <Layout><TemplateEditor /></Layout>
            </PrivateRoute>
          } />

          <Route path="/templates/:id/use" element={
            <PrivateRoute>
              <Layout><CreateFromTemplate /></Layout>
            </PrivateRoute>
          } />

          <Route path="/reports" element={
            <PrivateRoute>
              <Layout><ReportGenerator /></Layout>
            </PrivateRoute>
          } />

          <Route path="/predict" element={
            <PrivateRoute>
              <Layout><PredictDashboard /></Layout>
            </PrivateRoute>
          } />

          <Route path="/users" element={
            <PrivateRoute>
              <Layout><Users /></Layout>
            </PrivateRoute>
          } />

          <Route path="/settings" element={
            <PrivateRoute>
              <Layout><Settings /></Layout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
