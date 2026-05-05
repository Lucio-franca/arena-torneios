import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminConfiguracoes() {
  const { session } = useAuth()
  const [email, setEmail] = useState(session?.user?.email || '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvarEmail = async (e) => {
    e.preventDefault()
    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ email })
    setSalvando(false)
    if (error) { toast.error('Erro ao atualizar e-mail'); return }
    toast.success('E-mail atualizado! Confirme no seu e-mail.')
  }

  const salvarSenha = async (e) => {
    e.preventDefault()
    if (novaSenha.length < 6) { toast.error('Senha precisa ter pelo menos 6 caracteres'); return }
    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvando(false)
    if (error) { toast.error('Erro ao atualizar senha'); return }
    toast.success('Senha atualizada!')
    setSenhaAtual('')
    setNovaSenha('')
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-white font-semibold text-lg mb-6">Configurações</h1>

      <div className="card mb-4">
        <h2 className="text-white font-medium mb-4 text-sm">Alterar e-mail</h2>
        <form onSubmit={salvarEmail} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar e-mail'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-white font-medium mb-4 text-sm">Alterar senha</h2>
        <form onSubmit={salvarSenha} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Nova senha</label>
            <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          </div>
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}