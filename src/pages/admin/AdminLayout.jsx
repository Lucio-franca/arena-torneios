import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, Users, Settings, LogOut, Menu, X } from 'lucide-react'

export default function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-teal/10 text-teal font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`

  const NavLinks = () => (
    <>
      <NavLink to="/admin/eventos" className={linkClass} onClick={() => setMenuAberto(false)}>
        <CalendarDays size={16} /> Eventos
      </NavLink>
      <NavLink to="/admin/inscricoes" className={linkClass} onClick={() => setMenuAberto(false)}>
        <Users size={16} /> Inscrições
      </NavLink>
      <NavLink to="/admin/configuracoes" className={linkClass} onClick={() => setMenuAberto(false)}>
        <Settings size={16} /> Configurações
      </NavLink>
    </>
  )

  return (
    <div className="min-h-screen bg-bg">
      {/* Navbar mobile */}
      <nav className="lg:hidden bg-bg-2 border-b border-white/10 px-4 py-3 flex justify-between items-center">
        <span className="text-teal font-bold text-sm">🏐 Arena Torneios — Admin</span>
        <button onClick={() => setMenuAberto(!menuAberto)} className="text-slate-400">
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div className="lg:hidden bg-bg-2 border-b border-white/10 px-4 py-3 flex flex-col gap-1">
          <NavLinks />
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-56 min-h-screen bg-bg-2 border-r border-white/10 flex-col p-4">
          <div className="mb-8 px-2">
            <span className="text-teal font-bold text-sm">🏐 Arena Torneios</span>
            <p className="text-slate-500 text-xs mt-1">Painel Admin</p>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            <NavLinks />
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}