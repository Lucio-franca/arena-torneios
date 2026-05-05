import { useState, useRef, useEffect } from 'react'
import { useEventos } from '../../hooks/useEventos'
import { supabase } from '../../lib/supabase'
import { Plus, CalendarDays, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'

const vazio = {
  nome: '', local: '', data_evento: '', horario: '',
  limite: 16, chave_pix: '', descricao: '', valor: ''
}

// ─── Stepper ────────────────────────────────────────────────────────────────
function LimiteStepper({ value, onChange }) {
  const change = (delta) => {
    const novo = value + delta
    if (novo < 2) return
    onChange(novo)
  }
  return (
    <div className="flex items-center justify-center gap-4">
      <motion.button
        type="button"
        onClick={() => change(-2)}
        whileTap={{ scale: 0.85 }}
        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white text-lg font-bold
                   hover:border-teal hover:text-teal transition-colors flex items-center justify-center"
      >−</motion.button>

      <div className="relative w-16 text-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-white font-bold text-xl block"
          >{value}</motion.span>
        </AnimatePresence>
        <p className="text-slate-500 text-xs mt-0.5">duplas</p>
      </div>

      <motion.button
        type="button"
        onClick={() => change(2)}
        whileTap={{ scale: 0.85 }}
        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white text-lg font-bold
                   hover:border-teal hover:text-teal transition-colors flex items-center justify-center"
      >+</motion.button>
    </div>
  )
}

// ─── Formatação de valor em tempo real ──────────────────────────────────────
function useValorInput(initial = '') {
  const [display, setDisplay] = useState(initial)

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) { setDisplay(''); return }
    const num = parseInt(raw, 10) / 100
    setDisplay(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }

  const toFloat = () => {
    if (!display) return null
    return parseFloat(display.replace(/\./g, '').replace(',', '.'))
  }

  const reset = () => setDisplay('')

  return { display, handleChange, toFloat, reset }
}

// ─── Menu "três pontinhos" ───────────────────────────────────────────────────
function DotsMenu({ ev, onToggle, onExcluir }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.85 }}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
      >
        <MoreVertical size={15} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[130px] rounded-xl overflow-hidden"
            style={{ background: 'rgba(22,27,39,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
          >
            <button
              onClick={() => { onToggle(ev); setOpen(false) }}
              className="w-full text-left text-xs text-slate-300 px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              {ev.status === 'aberto' ? 'Encerrar evento' : 'Reabrir evento'}
            </button>
            <div className="h-px bg-white/5 mx-2" />
            <button
              onClick={() => { onExcluir(ev.id); setOpen(false) }}
              className="w-full text-left text-xs text-red-400 px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              Excluir evento
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function AdminEventos() {
  const { eventos, loading, setEventos } = useEventos()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(vazio)
  const [salvando, setSalvando] = useState(false)
  const valor = useValorInput()
  const [pix, setPix] = useState('')

  const openModal = () => {
    setForm(vazio)
    valor.reset()
    setPix('')
    setModal(true)
  }

  const handleHorario = (e) => {
    const val = e.target.value
    const partes = val.split(':')
    if (partes.length === 2) {
      const h = parseInt(partes[0])
      const m = parseInt(partes[1])
      if (h > 23 || m > 59) { toast.error('Horário inválido'); return }
    }
    setForm({ ...form, horario: val })
  }

  const salvar = async (e) => {
    e.preventDefault()

    if (!form.nome.trim() || !form.local.trim() || !pix.trim()) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    if (form.horario) {
      const [h, m] = form.horario.split(':').map(Number)
      if (isNaN(h) || isNaN(m) || h > 23 || m > 59) {
        toast.error('Horário inválido! Use o formato HH:MM')
        return
      }
    }

    if (form.data_evento) {
      const d = new Date(form.data_evento)
      if (isNaN(d.getTime())) { toast.error('Data inválida!'); return }
    }

    setSalvando(true)
    const payload = {
      ...form,
      chave_pix: pix,
      valor: valor.toFloat(),
    }
    const { data, error } = await supabase.from('eventos').insert(payload).select().single()
    setSalvando(false)
    if (error) { toast.error('Erro ao salvar evento'); return }
    setEventos(prev => [data, ...prev])
    setModal(false)
    toast.success('Evento criado!')
  }

  const toggleStatus = async (ev) => {
    const novo = ev.status === 'aberto' ? 'fechado' : 'aberto'
    const { error } = await supabase.from('eventos').update({ status: novo }).eq('id', ev.id)
    if (!error) setEventos(prev => prev.map(e => e.id === ev.id ? { ...e, status: novo } : e))
  }

  const excluir = async (id) => {
    if (!confirm('Excluir este evento e todas as inscrições?')) return
    const { error } = await supabase.from('eventos').delete().eq('id', id)
    if (!error) setEventos(prev => prev.filter(e => e.id !== id))
    else toast.error('Erro ao excluir')
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-white font-semibold text-lg">Eventos</h1>
          <p className="text-slate-400 text-sm">{eventos.length} evento(s) cadastrado(s)</p>
        </div>
        <motion.button
          onClick={openModal}
          className="flex items-center gap-2 bg-teal text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gold transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} /> Novo evento
        </motion.button>
      </div>

      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum evento ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {eventos.map((ev, i) => {
            const inscritos = ev.inscricoes?.[0]?.count || 0
            const pct = Math.round((inscritos / ev.limite) * 100)
            const dataFormatada = ev.data_evento
              ? new Date(ev.data_evento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              : 'Data a definir'

            return (
              <motion.div
                key={ev.id}
                className="card flex items-center gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge ${ev.status === 'aberto' ? 'badge-open' : 'badge-closed'}`}>
                      {ev.status === 'aberto' ? 'Aberto' : 'Encerrado'}
                    </span>
                    <h3 className="text-white font-medium text-sm truncate">{ev.nome}</h3>
                    {ev.valor != null && (
                      <span className="text-xs text-teal font-medium">
                        R$ {parseFloat(ev.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs">
                    {dataFormatada} • {ev.local}{ev.horario && ` • ${ev.horario}`}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="bg-white/5 rounded-full h-1.5 flex-1 overflow-hidden">
                      <motion.div
                        className="h-full bg-teal rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{inscritos}/{ev.limite}</span>
                  </div>
                </div>

                <DotsMenu ev={ev} onToggle={toggleStatus} onExcluir={excluir} />
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setModal(false)}
            />
            <motion.div
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
              style={{ background: 'rgba(22, 27, 39, 0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2 className="text-white font-semibold mb-5 text-base">Novo Evento</h2>
              <form onSubmit={salvar} className="space-y-4">

                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Nome *</label>
                  <input
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder="Torneio Verão"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Local *</label>
                  <input
                    value={form.local}
                    onChange={e => setForm({ ...form, local: e.target.value })}
                    placeholder="Praia Central, Floripa"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Data</label>
                    <input
                      type="date"
                      value={form.data_evento}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm({ ...form, data_evento: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Horário</label>
                    <input type="time" value={form.horario} onChange={handleHorario} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Limite de duplas *</label>
                  <div className="flex justify-center py-1">
                    <LimiteStepper value={form.limite} onChange={v => setForm({ ...form, limite: v })} />
                  </div>
                  <p className="text-slate-600 text-xs mt-1 text-center">Sempre número par — cada dupla tem 2 jogadores</p>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Valor da inscrição (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none select-none">R$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={valor.display}
                      onChange={valor.handleChange}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Chave PIX *</label>
                  <input
                    value={pix}
                    onChange={e => setPix(e.target.value)}
                    placeholder="CPF, telefone, e-mail ou chave aleatória"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">Descrição</label>
                  <textarea
                    rows={2}
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Informações extras..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <motion.button
                    type="button"
                    onClick={() => setModal(false)}
                    className="btn-secondary flex-1"
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={salvando}
                    whileTap={{ scale: 0.97 }}
                  >
                    {salvando ? 'Salvando...' : 'Criar evento'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}