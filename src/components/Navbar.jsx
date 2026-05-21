import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/login') return null;

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-dark border-b border-gold-light/25 px-12 flex items-center justify-between h-16 sticky top-0 z-50">
      <Link to="/" className="font-serif text-[22px] text-gold tracking-[2px] cursor-pointer no-underline">
        GROOVEHAUS
      </Link>
      
      <nav className="flex gap-8">
        <Link to="/" className="text-xs tracking-[2px] uppercase text-cream hover:text-gold transition-colors duration-200">
          Catálogo
        </Link>
        {profile?.role === 'admin' && (
          <Link to="/admin" className="text-xs tracking-[2px] uppercase text-cream hover:text-gold transition-colors duration-200">
            Administración
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-5">
        {user ? (
          <>
            <span className="text-[13px] text-cream">
              Hola, {profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-transparent border border-gold-light/25 text-gold px-4 py-[7px] text-xs tracking-[1px] cursor-pointer font-sans transition-colors duration-200 hover:bg-gold/10"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <Link 
              to="/login"
              className="bg-transparent border border-gold-light/25 text-gold px-4 py-[7px] text-xs tracking-[1px] cursor-pointer font-sans transition-colors duration-200 hover:bg-gold/10 no-underline"
            >
              Iniciar Sesión
            </Link>
          )
        )}
      </div>
    </header>
  )
}
