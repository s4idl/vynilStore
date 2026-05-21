import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vinyl, setVinyl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDesc, setShowDesc] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [qty, setQty] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchVinyl()
  }, [id])

  const fetchVinyl = async () => {
    try {
      const { data, error } = await supabase
        .from('vinyls')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setVinyl(data)
    } catch (err) {
      console.error(err)
      alert('Error cargando el vinilo')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-gray">Cargando detalles...</div>
  if (!vinyl) return <div className="p-12 text-center text-gray">Vinilo no encontrado</div>

  const handleBuy = () => setModalOpen(true)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="px-12 py-3.5 flex items-center gap-3 bg-dark border-b border-gold/20">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 text-gold text-[12px] tracking-[1.5px] uppercase font-medium hover:text-gold-light transition-colors"
        >
          ← Catálogo
        </Link>
        <span className="text-gold/30 text-lg">|</span>
        <span className="text-cream/60 text-[12px] tracking-[1px] truncate max-w-[300px]">{vinyl.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
        {/* LEFT: Image */}
        <div className="relative bg-[#EDE9DF] flex items-center justify-center p-12 min-h-[500px]">
          <img 
            src={vinyl.cover_url} 
            alt={vinyl.title} 
            className="w-full max-w-[420px] aspect-square object-cover shadow-xl"
          />
        </div>

        {/* RIGHT: Info */}
        <div className="p-12 border-l border-gold-light/25 bg-cream">
          <Link to="/" className="text-[11px] tracking-[3px] uppercase text-gold hover:underline inline-block mb-3.5">
            {vinyl.artist}
          </Link>
          
          <div className="flex gap-2 mb-3.5 flex-wrap">
            {vinyl.badge && (
              <span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 font-medium text-white ${vinyl.badge_class === 'exclusive' ? 'bg-[#6B2FA0]' : 'bg-red'}`}>
                {vinyl.badge}
              </span>
            )}
            <span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 font-medium text-white ${vinyl.availability === 'preventa' ? 'bg-red' : 'bg-green'}`}>
              {vinyl.availability === 'preventa' ? 'Preventa' : 'Disponible'}
            </span>
          </div>

          <h1 className="font-serif text-[34px] leading-tight text-dark mb-5">{vinyl.title}</h1>
          <div className="text-[26px] font-medium text-dark mb-2">${vinyl.price.toLocaleString()}</div>
          <div className="text-[11px] text-gray mb-1.5">SKU: GH-{String(vinyl.id).slice(0,6).toUpperCase()}</div>
          
          {vinyl.availability === 'preventa' && (
            <>
              <div className="text-xs font-medium text-dark mb-1">**PREVENTA**</div>
              <div className="text-xs text-gray mb-6">Fecha estimada de salida: Pronto</div>
            </>
          )}

          <div className="flex items-center gap-3 mb-6 mt-6">
            <select 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))}
              className="p-3 border border-gold-light/50 bg-white font-sans text-sm outline-none w-[72px] cursor-pointer focus:border-gold"
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button 
              onClick={handleBuy}
              className="flex-1 py-3.5 px-6 bg-red text-white font-sans font-medium text-[13px] tracking-[2px] uppercase border-none cursor-pointer transition-colors hover:bg-[#A02318]"
            >
              Comprar
            </button>
          </div>

          {/* Accordeon Descripcion */}
          <div className="mt-6 border border-gold-light/25">
            <div 
              className="flex items-center justify-between p-3.5 bg-white cursor-pointer text-[13px] font-medium tracking-[1px]"
              onClick={() => setShowDesc(!showDesc)}
            >
              Descripción <span>{showDesc ? '∧' : '∨'}</span>
            </div>
            {showDesc && (
              <div className="p-4 text-[13px] leading-[1.8] text-[#4A4030] bg-white border-t border-gold-light/25">
                <p className="mb-4">{vinyl.description || 'Sin descripción disponible.'}</p>
                
                {vinyl.tracklist && (
                  <div>
                    <div className="mt-3 text-[11px] tracking-[2px] uppercase text-gray mb-2 font-medium">Tracklist:</div>
                    {Object.entries(vinyl.tracklist).map(([side, tracks]) => (
                      <div key={side} className="mb-3 last:mb-0">
                        <div className="font-medium text-[12px] tracking-[1px] uppercase text-gray mb-1.5">{side}</div>
                        {tracks.map((t, i) => (
                          <div key={i} className="py-1 text-[13px] text-dark border-b border-gold-light/10 last:border-0">
                            {i+1}. {t}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Important info */}
          <div className="mt-3 border border-gold-light/25">
            <div 
              className="flex items-center justify-between p-3.5 bg-white cursor-pointer text-[13px] font-medium tracking-[1px]"
              onClick={() => setShowInfo(!showInfo)}
            >
              Información importante <span>{showInfo ? '∧' : '∨'}</span>
            </div>
            {showInfo && (
              <div className="p-4 text-[13px] leading-[1.8] text-[#4A4030] bg-white border-t border-gold-light/25">
                <p className="mb-2.5">En los productos de importación por favor considera hasta 15 días adicionales para el envío desde nuestro almacén + el tiempo estimado de la mensajería.</p>
                <p>Las imágenes que se muestran son simulaciones y los productos terminados pueden tener variaciones en el arte, diseño, embalaje e impresión.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-dark/85 z-50 flex items-center justify-center p-4">
          <div className="bg-warm border border-gold-light/25 p-12 max-w-[460px] w-full text-center animate-[modalIn_0.3s_ease]">
            <div className="w-20 h-20 rounded-full bg-dark border-[3px] border-gold mx-auto mb-6 flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-5 h-5 rounded-full bg-warm border-2 border-gold"></div>
            </div>
            <div className="text-[11px] tracking-[3px] uppercase text-gold mb-3">¡Compra Exitosa!</div>
            <h2 className="font-serif text-[26px] text-cream mb-4 leading-snug">Has comprado "{vinyl.title}"</h2>
            <p className="text-sm text-gray leading-[1.7] mb-8">
              Tu vinilo de {vinyl.artist} será preparado y enviado pronto. (Cantidad: {qty})
            </p>
            <button 
              onClick={() => { setModalOpen(false); navigate('/') }}
              className="bg-gold text-dark border-none px-8 py-3 font-sans text-xs tracking-[2px] uppercase cursor-pointer font-medium transition-colors duration-200 hover:bg-gold-light"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
