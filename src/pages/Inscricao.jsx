import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useInscricoes } from '../hooks/useInscricoes'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' }
})

export default function Inscricao() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const { inscrever } = useInscricoes()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [arquivo, setArquivo] = useState(null)
  const [form, setForm] = useState({
    nome_equipe: '', capitao: '', email: '',
    telefone: '', categoria: 'Masculino', referencia_pix: '', observacoes: ''
  })

  useEffect(() => {
    supabase.from('eventos').select('*, inscricoes(count)').eq('id', eventoId).single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/'); return }
        setEvento(data)
        setLoading(false)
      })
  }, [eventoId])

  const copiarPix = () => {
    navigator.clipboard.writeText(evento.chave_pix)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleArquivo = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Arquivo muito grande (máx 5MB)'); return }
    setArquivo(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!arquivo) { toast.error('Anexe o comprovante de pagamento'); return }
    setEnviando(true)
    const ok = await inscrever({ formData: form, arquivo, eventoId })
    setEnviando(false)
    if (ok) navigate('/')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando...</div>

  const dataFormatada = evento.data_evento
    ? new Date(evento.data_evento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Data a definir'

  return (
    <div className="min-h-screen bg-bg">
      <motion.nav
        className="bg-bg-2 border-b border-white/10 px-6 py-4 flex items-center gap-3"
        {...fadeUp(0)}
      >
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-teal transition-colors">
          <ArrowLeft size={18} />
        </button>
        <span className="text-teal font-bold">🏐 Arena Torneios</span>
      </motion.nav>

      <div className="max-w-lg mx-auto px-5 py-8">
        <motion.div className="card mb-6 border-teal/30 bg-teal/5" {...fadeUp(0.05)}>
          <p className="text-teal font-semibold text-base">{evento.nome}</p>
          <p className="text-slate-400 text-xs mt-1">{dataFormatada} • {evento.local}{evento.horario && ` • ${evento.horario}`}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div className="grid grid-cols-2 gap-3" {...fadeUp(0.1)}>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Nome da equipe *</label>
              <input placeholder="Dragões da Areia" value={form.nome_equipe} onChange={e => setForm({...form, nome_equipe: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Capitão *</label>
              <input placeholder="Nome completo" value={form.capitao} onChange={e => setForm({...form, capitao: e.target.value})} required />
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-3" {...fadeUp(0.15)}>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">E-mail *</label>
              <input type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Telefone *</label>
              <input  onChange={e => setTelefone(formatarTelefone(e.target.value))} placeholder="(XX) XXXXX-XXXX" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} required />
             
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)}>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Categoria *</label>
            <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
              <option>Masculino</option>
              <option>Feminino</option>
              <option>Misto</option>
            </select>
          </motion.div>

          <motion.div className="bg-teal/5 border border-teal/25 border-dashed rounded-xl p-4" {...fadeUp(0.25)}>
            <p className="text-xs text-teal uppercase tracking-wider mb-1">Chave PIX</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-white text-sm font-medium break-all">{evento.chave_pix}</p>
              <button type="button" onClick={copiarPix} className="text-teal hover:text-gold transition-colors flex-shrink-0">
                {copiado ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.3)}>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Referência / Pagador *</label>
            <input placeholder="Nome usado no PIX ou referência" value={form.referencia_pix} onChange={e => setForm({...form, referencia_pix: e.target.value})} required />
          </motion.div>

          <motion.div {...fadeUp(0.35)}>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Comprovante *</label>
            <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 cursor-pointer hover:border-teal transition-colors">
              <span className="text-sm text-slate-400">
                {arquivo ? `✓ ${arquivo.name}` : 'Clique para escolher (imagem ou PDF, máx 5MB)'}
              </span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleArquivo} />
            </label>
          </motion.div>

          <motion.div {...fadeUp(0.4)}>
            <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Observações</label>
            <textarea placeholder="Preferências de horário, dúvidas..." rows={3} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
          </motion.div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={enviando}
            whileTap={{ scale: 0.97 }}
            {...fadeUp(0.45)}
          >
            {enviando ? 'Enviando...' : 'Enviar inscrição'}
          </motion.button>
        </form>
      </div>
    </div>
  )
}