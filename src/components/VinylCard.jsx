import { useState } from 'react'

export default function VinylCard({ vinyl, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="bg-card-bg border border-gold-light/25 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(26,18,8,0.12)] relative"
      onClick={() => onClick(vinyl.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-dark group">
        <img 
          src={vinyl.cover_url} 
          alt={vinyl.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {vinyl.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[9px] tracking-[1.5px] uppercase px-2 py-1 font-medium text-white ${vinyl.badge_class === 'exclusive' ? 'bg-[#6B2FA0]' : 'bg-red'}`}>
            {vinyl.badge}
          </span>
        )}
      </div>

      <div className="p-3.5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] tracking-[2px] uppercase text-[#8B7355]">{vinyl.artist}</div>
          <span className="text-[9px] tracking-[1px] uppercase text-gray border border-gold-light/40 px-1.5 py-0.5">{vinyl.type || 'LP'}</span>
        </div>
        <h3 className="font-serif text-[15px] text-dark mb-2.5 leading-snug">{vinyl.title}</h3>
        
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium text-dark">${vinyl.price.toLocaleString()}</span>
          <button 
            className="bg-dark text-gold border-none font-sans text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 cursor-pointer transition-colors duration-200 hover:bg-warm"
            onClick={(e) => {
              e.stopPropagation()
              onClick(vinyl.id)
            }}
          >
            Detalles
          </button>
        </div>
      </div>
    </div>
  )
}
