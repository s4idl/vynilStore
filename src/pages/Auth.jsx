import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../AuthContext'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        })
        if (error) throw error
        alert('Revisa tu correo electrónico para confirmar tu cuenta.')
      }
    } catch (err) {
      let msg = err.message
      if (msg.includes('already registered') || msg.includes('already been registered'))
        msg = 'Este correo ya está registrado.'
      else if (msg.includes('invalid email') || msg.includes('Invalid email'))
        msg = 'El formato del correo no es válido.'
      else if (msg.includes('Password should be at least'))
        msg = 'La contraseña debe tener mínimo 6 caracteres.'
      else if (msg.includes('Invalid login credentials'))
        msg = 'Correo o contraseña incorrectos.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-dark relative overflow-hidden h-full py-20">
      <div className="absolute w-[600px] h-[600px] rounded-full border border-gold/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-gold/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="bg-warm border border-gold-light/25 rounded-sm p-12 w-full max-w-[420px] relative z-10">
        <h1 className="font-serif text-[28px] text-gold tracking-[2px] text-center mb-1.5">
          GROOVEHAUS
        </h1>
        <p className="text-center text-xs text-gray tracking-[3px] uppercase mb-9">
          Vinilos de colección
        </p>

        <div className="flex border-b border-gold-light/25 mb-7">
          <button 
            className={`flex-1 pb-2.5 text-center text-[13px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-colors duration-200 ${isLogin ? 'text-gold border-gold' : 'text-gray border-transparent'}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Iniciar sesión
          </button>
          <button 
            className={`flex-1 pb-2.5 text-center text-[13px] tracking-[1px] uppercase cursor-pointer border-b-2 transition-colors duration-200 ${!isLogin ? 'text-gold border-gold' : 'text-gray border-transparent'}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] tracking-[2px] uppercase text-gray mb-1.5">Nombre completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full px-3.5 py-3 bg-white/5 border border-gold-light/25 rounded-sm text-cream font-sans text-sm outline-none transition-colors duration-200 focus:border-gold placeholder-gray/50"
                placeholder="Tu nombre"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-gray mb-1.5">Correo electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-3 bg-white/5 border border-gold-light/25 rounded-sm text-cream font-sans text-sm outline-none transition-colors duration-200 focus:border-gold placeholder-gray/50"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[2px] uppercase text-gray mb-1.5">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-3 pr-10 bg-white/5 border border-gold-light/25 rounded-sm text-cream font-sans text-sm outline-none transition-colors duration-200 focus:border-gold placeholder-gray/50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-gold transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className="text-[11px] text-[#E07060] min-h-[16px]">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gold text-dark font-sans font-medium text-[13px] tracking-[2px] uppercase rounded-sm cursor-pointer mt-2 transition-colors duration-200 hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Cargando...' : isLogin ? 'Entrar al club' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
