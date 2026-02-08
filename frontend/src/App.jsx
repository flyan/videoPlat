import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Home from './pages/Home'
import Room from './pages/Room'
import Recordings from './pages/Recordings'

function App() {
  const { isAuthenticated } = useAuthStore()

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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
