import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import VinylCard from '../components/VinylCard'
import { Link, useNavigate } from 'react-router-dom'

export default function Catalog() {
  const [vinyls, setVinyls] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchVinyls()
  }, [])

  const fetchVinyls = async () => {
    try {
      const { data, error } = await supabase
        .from('vinyls')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setVinyls(data || [])
    } catch (error) {
      console.error('Error fetching vinyls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (id) => {
    navigate(`/vinilo/${id}`)
  }

  if (loading) return <div className="p-12 text-center text-gray">Cargando catálogo...</div>

  return (
    <div className="flex-1">
      {/* Title Section */}
      <div className="px-12 pt-12 pb-4">
        <p className="text-[10px] tracking-[3px] uppercase text-[#8B7355] mb-1">Colección</p>
        <h1 className="font-serif font-bold text-[38px] text-dark leading-tight tracking-tight">Vinilos Trending</h1>
      </div>

      <div className="px-12 pt-4 pb-16">
        <div className="text-xs text-gray tracking-[1px] mb-6 uppercase">
          {vinyls.length} vinilo{vinyls.length !== 1 ? 's' : ''} encontrado{vinyls.length !== 1 ? 's' : ''}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-7">
          {vinyls.map(vinyl => (
            <VinylCard key={vinyl.id} vinyl={vinyl} onClick={handleCardClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
