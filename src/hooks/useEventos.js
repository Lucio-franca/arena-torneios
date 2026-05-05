import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useEventos(apenasAbertos = false) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase
      .from('eventos')
      .select('*, inscricoes(count)')
      .order('data_evento', { ascending: true })

    if (apenasAbertos) query = query.eq('status', 'aberto')

    query.then(({ data, error }) => {
      if (!error && data) setEventos(data)
      setLoading(false)
    })
  }, [apenasAbertos])

  return { eventos, loading, setEventos }
}