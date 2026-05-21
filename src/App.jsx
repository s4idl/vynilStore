import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Navbar from './components/Navbar'
import Catalog from './pages/Catalog'
import Detail from './pages/Detail'
import Auth from './pages/Auth'
import Admin from './pages/Admin'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth()
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream">Cargando...</div>
  if (!user) return <Navigate to="/login" />
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/" />
  
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-cream text-dark font-sans flex flex-col relative">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Catalog />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vinilo/:id" 
            element={
              <ProtectedRoute>
                <Detail />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Auth />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
