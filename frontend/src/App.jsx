import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Home from './pages/Home'
import Room from './pages/Room'
import Recordings from './pages/Recordings'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import Rooms from './pages/admin/Rooms'
import AdminRecordings from './pages/admin/Recordings'
import OperationLogs from './pages/admin/OperationLogs'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  // 检查是否是管理员
  const isAdmin = user?.role === 'ADMIN'

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/room/:roomId"
        element={<Room />}
      />
      <Route
        path="/recordings"
        element={isAuthenticated ? <Recordings /> : <Navigate to="/login" />}
      />

      {/* 管理台路由 */}
      <Route
        path="/admin"
        element={
          isAuthenticated && isAdmin ? (
            <AdminLayout />
          ) : (
            <Navigate to="/login" />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="recordings" element={<AdminRecordings />} />
        <Route path="logs" element={<OperationLogs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
