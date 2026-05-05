import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await signIn(email, senha)
    setLoading(false)
    if (error) { setErro('E-mail ou senha incorretos.'); return }
    navigate('/admin/eventos')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Fundo desfocado */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal com animação */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          background: 'rgba(22, 27, 39, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="text-center mb-6">
          <span className="text-3xl">🏐</span>
          <h2 className="text-white font-semibold text-lg mt-2">Área do Admin</h2>
          <p className="text-slate-400 text-sm">Acesso restrito ao organizador.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          {erro && <p className="text-red-400 text-sm">{erro}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="text-slate-500 text-xs mt-4 hover:text-teal transition-colors block text-center w-full">
          ← Voltar ao site
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}