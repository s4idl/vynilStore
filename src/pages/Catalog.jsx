import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import VinylCard from '../components/VinylCard'
import { Link, useNavigate } from 'react-router-dom'

export default function Catalog() {
  const [vinyls, setVinyls] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Add a small debounce for better UX
    const timer = setTimeout(() => {
      fetchVinyls()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchVinyls = async () => {
    try {
      // 1. Sanitización Anti-XSS básica (remueve caracteres peligrosos < >)
      const sanitizedSearch = searchTerm.replace(/[<>]/g, '')

      // 2. Consulta a Supabase (Seguro contra SQL Injection nativamente)
      let query = supabase
        .from('vinyls')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (sanitizedSearch.trim() !== '') {
        query = query.ilike('title', `%${sanitizedSearch}%`)
      }

      const { data, error } = await query
      
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

  return (
    <div className="flex-1">
      {/* Title Section */}
      <div className="px-12 pt-12 pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-[#8B7355] mb-1">Colección</p>
          <h1 className="font-serif font-bold text-[38px] text-dark leading-tight tracking-tight">Vinilos Trending</h1>
        </div>
        
        {/* Barra de búsqueda segura */}
        <div className="w-full md:w-72 relative">
          <input 
            type="text" 
            placeholder="Buscar por título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gold-light/40 px-4 py-2.5 text-sm text-dark placeholder:text-gray focus:outline-none focus:border-gold transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>

      <div className="px-12 pt-4 pb-16">
        {loading ? (
          <div className="py-12 text-center text-gray">Cargando catálogo...</div>
        ) : (
          <>
            <div className="text-xs text-gray tracking-[1px] mb-6 uppercase">
              {vinyls.length} vinilo{vinyls.length !== 1 ? 's' : ''} encontrado{vinyls.length !== 1 ? 's' : ''}
            </div>

            {vinyls.length === 0 ? (
              <div className="py-20 text-center text-gray border border-dashed border-gold-light/30">
                No se encontraron vinilos que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-7">
                {vinyls.map(vinyl => (
                  <VinylCard key={vinyl.id} vinyl={vinyl} onClick={handleCardClick} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
