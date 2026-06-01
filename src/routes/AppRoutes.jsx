import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'

import LandingPage from '../features/landing/LandingPage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import BooksPage from '../features/books/BooksPage'
import BookDetailPage from '../features/books/BookDetailPage'
import AddBookPage from '../features/books/AddBookPage'
import EditBookPage from '../features/books/EditBookPage'
import MembersPage from '../features/members/MembersPage'
import MemberProfilePage from '../features/members/MemberProfilePage'
import AddMemberPage from '../features/members/AddMemberPage'
import EditMemberPage from '../features/members/EditMemberPage'
import IssueBookPage from '../features/issueReturn/IssueBookPage'
import ReturnBookPage from '../features/issueReturn/ReturnBookPage'
import IssueHistoryPage from '../features/issueReturn/IssueHistoryPage'
import ReportsPage from '../features/reports/ReportsPage'
import ProfilePage from '../features/profile/ProfilePage'
import SettingsPage from '../features/profile/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
      <Route element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/books/add" element={<AddBookPage />} />
        <Route path="/books/edit/:id" element={<EditBookPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<MemberProfilePage />} />
        <Route path="/members/add" element={<AddMemberPage />} />
        <Route path="/members/edit/:id" element={<EditMemberPage />} />
        <Route path="/issue" element={<IssueBookPage />} />
        <Route path="/return" element={<ReturnBookPage />} />
        <Route path="/history" element={<IssueHistoryPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
