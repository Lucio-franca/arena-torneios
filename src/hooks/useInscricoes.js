import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useInscricoes() {
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(false)

  const buscar = async (eventoId = null) => {
    setLoading(true)
    let query = supabase
      .from('inscricoes')
      .select('*, eventos(nome)')
      .order('created_at', { ascending: false })

    if (eventoId) query = query.eq('evento_id', eventoId)

    const { data, error } = await query
    if (!error && data) setInscricoes(data)
    setLoading(false)
  }

  const inscrever = async ({ formData, arquivo, eventoId }) => {
    try {
      // Upload do comprovante
      const ext = arquivo.name.split('.').pop()
      const path = `${eventoId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(path, arquivo)

      if (uploadError) { toast.error('Erro ao enviar comprovante'); return false }

      // Salva inscrição
      const { error } = await supabase.from('inscricoes').insert({
        ...formData,
        evento_id: eventoId,
        comprovante_path: path,
      })

      if (error) { toast.error('Erro ao salvar inscrição'); return false }

      toast.success('Inscrição enviada! Aguarde a confirmação.')
      return true
    } catch {
      toast.error('Erro inesperado')
      return false
    }
  }

  const confirmar = async (id) => {
    const { error } = await supabase
      .from('inscricoes')
      .update({ status_pagamento: 'confirmado', confirmado_em: new Date().toISOString() })
      .eq('id', id)
    if (!error) await buscar()
  }

  const excluir = async (id) => {
    const { error } = await supabase.from('inscricoes').delete().eq('id', id)
    if (!error) await buscar()
  }

  return { inscricoes, loading, buscar, inscrever, confirmar, excluir }
}