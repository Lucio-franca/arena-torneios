import { useEffect, useState } from 'react'
import { useInscricoes } from '../../hooks/useInscricoes'
import { useEventos } from '../../hooks/useEventos'
import { supabase } from '../../lib/supabase'
import { Search, Download } from 'lucide-react'
import { motion, useSpring, useTransform } from 'motion/react'

function AnimatedCount({ value }) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 })
  const display = useTransform(spring, v => Math.round(v))

  useEffect(() => {
    spring.set(value)
  }, [value])

  return <motion.span>{display}</motion.span>
}

export default function AdminInscricoes() {
  const { inscricoes, loading, buscar, confirmar, excluir } = useInscricoes()
  const { eventos } = useEventos()

  const [filtroEvento, setFiltroEvento] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    buscar(filtroEvento || null)
  }, [filtroEvento])

  const filtradas = inscricoes.filter(i => {
    const matchStatus = !filtroStatus || i.status_pagamento === filtroStatus
    const matchBusca =
      !busca ||
      i.nome_equipe.toLowerCase().includes(busca.toLowerCase()) ||
      i.capitao.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  const exportarCSV = () => {
    const header = 'Equipe,Capitão,Email,Telefone,Categoria,Status,Evento,Data\n'
    const rows = filtradas
      .map(
        i =>
          `"${i.nome_equipe}","${i.capitao}","${i.email}","${i.telefone}","${i.categoria}","${i.status_pagamento}","${i.eventos?.nome || ''}","${new Date(
            i.created_at
          ).toLocaleDateString('pt-BR')}"`
      )
      .join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inscricoes.csv'
    a.click()
  }

  const verComprovante = path => {
    const { data } = supabase.storage.from('comprovantes').getPublicUrl(path)
    window.open(data.publicUrl, '_blank')
  }

  const total = filtradas.length
  const confirmados = filtradas.filter(i => i.status_pagamento === 'confirmado').length
  const pendentes = filtradas.filter(i => i.status_pagamento === 'pendente').length

  return (
    <div className="p-6">
      {/* TOPO COM CONTADORES ANIMADOS */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-white font-semibold text-lg">Inscrições</h1>
          <p className="text-slate-400 text-sm">
            <AnimatedCount value={total} /> total •{' '}
            <AnimatedCount value={confirmados} /> confirmados •{' '}
            <AnimatedCount value={pendentes} /> pendentes
          </p>
        </div>

        <button onClick={exportarCSV} className="flex items-center gap-2 btn-secondary">
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          className="flex-1 min-w-40"
          value={filtroEvento}
          onChange={e => setFiltroEvento(e.target.value)}
        >
          <option value="">Todos os eventos</option>
          {eventos.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.nome}
            </option>
          ))}
        </select>

        <select
          className="w-40"
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
        </select>

        <div className="relative flex-1 min-w-40">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            className="pl-8"
            placeholder="Buscar equipe ou capitão..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA */}
      {loading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <p className="text-center py-20 text-slate-400">
          Nenhuma inscrição encontrada.
        </p>
      ) : (
        <div className="grid gap-2">
          {filtradas.map(i => (
            <motion.div
              key={i.id}
              className="card flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`badge ${
                      i.status_pagamento === 'confirmado'
                        ? 'badge-confirmed'
                        : 'badge-pending'
                    }`}
                  >
                    {i.status_pagamento}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {i.nome_equipe}
                  </span>
                  <span className="text-slate-500 text-xs">
                    • {i.categoria}
                  </span>
                </div>

                <p className="text-slate-400 text-xs">
                  {i.capitao} • {i.email} • {i.telefone}
                </p>

                {i.eventos?.nome && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    📅 {i.eventos.nome}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {i.comprovante_path && (
                  <button
                    onClick={() => verComprovante(i.comprovante_path)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Ver comprovante
                  </button>
                )}

                {i.status_pagamento === 'pendente' && (
                  <button
                    onClick={() => confirmar(i.id)}
                    className="text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    Confirmar
                  </button>
                )}

                <button
                  onClick={() => excluir(i.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors text-xs px-2"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}