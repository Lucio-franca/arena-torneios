import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Inscricao from './pages/Inscricao'
import AdminLayout from './pages/admin/AdminLayout'
import AdminEventos from './pages/admin/AdminEventos'
import AdminInscricoes from './pages/admin/AdminInscricoes'
import AdminConfiguracoes from './pages/admin/AdminConfiguracoes'

function RotaProtegida({ children }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Carregando...
    </div>
  )
  if (!session) return <Navigate to="/" replace />
  return children
}

export const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/inscricao/:eventoId" element={<PageWrapper><Inscricao /></PageWrapper>} />
        <Route path="/admin" element={<RotaProtegida><AdminLayout /></RotaProtegida>}>
          <Route index element={<Navigate to="/admin/eventos" replace />} />
          <Route path="eventos" element={<PageWrapper><AdminEventos /></PageWrapper>} />
          <Route path="inscricoes" element={<PageWrapper><AdminInscricoes /></PageWrapper>} />
          <Route path="configuracoes" element={<PageWrapper><AdminConfiguracoes /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  )
}