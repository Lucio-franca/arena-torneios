import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventos } from '../hooks/useEventos'
import { useAuth } from '../context/AuthContext'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

function formatarTelefone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 11)
  if (digits.length > 10) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  if (digits.length > 6)  return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  if (digits.length > 2)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  return digits
}

function StatusBadge({ status, inscritos, limite }) {
  if (status === 'fechado') return <span className="badge badge-closed">Encerrado</span>
  if (inscritos >= limite) return <span className="badge badge-full">Esgotado</span>
  return <span className="badge badge-open">Inscrições abertas</span>
}

function EventoCard({ evento, onClick }) {
  const inscritos = evento.inscricoes?.[0]?.count || 0
  const pct = Math.round((inscritos / evento.limite) * 100)
  const aberto = evento.status === 'aberto' && inscritos < evento.limite

  const dataFormatada = evento.data_evento
    ? new Date(evento.data_evento + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Data a definir'

  return (
    <motion.div
      onClick={() => aberto && onClick(evento.id)}
      className={`card transition-colors ${aberto ? 'hover:border-teal cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
      whileHover={aberto ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-2">
        <StatusBadge status={evento.status} inscritos={inscritos} limite={evento.limite} />
        {evento.valor != null && (
          <span className="text-teal font-bold text-sm whitespace-nowrap">
            R$ {parseFloat(evento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>

      <h3 className="text-white font-semibold text-base mt-2 mb-1">{evento.nome}</h3>

      <div className="space-y-1 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar size={13} /> {dataFormatada}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} /> {evento.local}
        </div>
        {evento.horario && (
          <div className="flex items-center gap-2">
            <Clock size={13} /> {evento.horario}
          </div>
        )}
        {evento.descricao && (
          <p className="text-slate-500 text-xs mt-2 line-clamp-2">{evento.descricao}</p>
        )}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{inscritos} / {evento.limite} duplas</span>
          <span>{pct}%</span>
        </div>
        <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { eventos, loading } = useEventos(true)
  const { signIn } = useAuth()

  const [modalAdmin, setModalAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoadingLogin(true)
    const { error } = await signIn(email, senha)
    setLoadingLogin(false)
    if (error) {
      setErro('E-mail ou senha incorretos.')
      return
    }
    navigate('/admin/eventos')
  }

  const fecharModal = () => {
    setModalAdmin(false)
    setErro('')
    setEmail('')
    setSenha('')
  }

  return (
    <div className="min-h-screen bg-bg">
      <AnimatePresence>
        {modalAdmin && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fecharModal} />
            <motion.div
              className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              style={{ background: 'rgba(22,27,39,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2 className="text-white text-lg font-semibold mb-4 text-center">Área do Admin</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Senha"
                  required
                />
                {erro && <p className="text-red-400 text-sm">{erro}</p>}
                <motion.button whileTap={{ scale: 0.97 }} className="btn-primary w-full">
                  {loadingLogin ? 'Entrando...' : 'Entrar'}
                </motion.button>
              </form>
              <button onClick={fecharModal} className="text-xs text-slate-500 mt-4 w-full">
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-bg-2 border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <span className="text-teal font-bold">🏐 Arena Torneios</span>
        <motion.button onClick={() => setModalAdmin(true)} whileTap={{ scale: 0.95 }} className="btn-secondary">
          Área do admin
        </motion.button>
      </nav>

      <div className="bg-bg-2 border-b border-white/10 px-6 py-10 text-center">
        <h1 className="text-3xl font-bold text-white">Escolha seu torneio</h1>
        <p className="text-slate-400 text-sm">Garanta sua vaga no próximo evento</p>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="card"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              >
                <div className="h-5 w-24 bg-white/10 rounded-full mb-3" />
                <div className="h-4 w-36 bg-white/10 rounded-full mb-2" />
                <div className="h-3 w-28 bg-white/10 rounded-full mb-1" />
                <div className="h-3 w-20 bg-white/10 rounded-full mb-4" />
                <div className="h-1.5 w-full bg-white/10 rounded-full" />
              </motion.div>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum torneio disponível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventos.map(ev => (
              <EventoCard key={ev.id} evento={ev} onClick={(id) => navigate(`/inscricao/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}