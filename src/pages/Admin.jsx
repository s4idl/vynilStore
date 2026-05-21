import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

const EMPTY_FORM = {
  title: '', artist: '', price: 0, year: new Date().getFullYear(),
  type: 'LP', availability: 'disponible', cover_url: '', description: ''
}

const TYPE_OPTIONS = ['LP', 'Single', 'Edición Limitada', 'EP']
const AVAIL_OPTIONS = ['disponible', 'preventa', 'agotado']

function VinylModal({ title, form, setForm, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/90 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden animate-[modalIn_0.25s_ease]">
        {/* Header */}
        <div className="bg-dark px-8 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-cream/50 mb-0.5">Groovehaus Admin</div>
            <h2 className="font-serif text-2xl text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-8">
          <div className="grid grid-cols-2 gap-5">
            
            {/* Título */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Título *</label>
              <input
                required type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="ej. Blonde"
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
              />
            </div>

            {/* Artista */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Artista *</label>
              <input
                required type="text"
                value={form.artist}
                onChange={e => setForm({ ...form, artist: e.target.value })}
                placeholder="ej. Frank Ocean"
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Precio ($) *</label>
              <input
                required type="number" min="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
              />
            </div>

            {/* Año */}
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Año *</label>
              <input
                required type="number" min="1900" max="2099"
                value={form.year}
                onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors bg-white cursor-pointer"
              >
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Disponibilidad */}
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Disponibilidad</label>
              <select
                value={form.availability}
                onChange={e => setForm({ ...form, availability: e.target.value })}
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors bg-white cursor-pointer"
              >
                {AVAIL_OPTIONS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
              </select>
            </div>

            {/* URL Portada */}
            <div className="col-span-2">
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">URL Portada</label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={form.cover_url}
                  onChange={e => setForm({ ...form, cover_url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
                />
                {form.cover_url && (
                  <img src={form.cover_url} alt="preview" className="w-12 h-12 object-cover border border-gold-light/30 shrink-0" onError={e => e.target.style.display='none'} />
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Descripción</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Breve descripción del álbum..."
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 mt-7 pt-6 border-t border-gold-light/20">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 border border-gold-light/40 text-gray text-[11px] tracking-[2px] uppercase hover:border-gold hover:text-dark transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-dark text-gold text-[11px] tracking-[2px] uppercase hover:bg-warm transition-colors font-medium"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Admin() {
  const [vinyls, setVinyls] = useState([])
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })

  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })
  const [editingId, setEditingId] = useState(null)

  // User creator
  const [userForm, setUserForm] = useState({ email: '', password: '', name: '' })
  const [userLoading, setUserLoading] = useState(false)
  const [userMsg, setUserMsg] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { fetchVinyls() }, [])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setUserLoading(true)
    setUserMsg(null)
    try {
      // Usar un cliente temporal para evitar el session swap del admin (Gotrue race condition)
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const tempClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      })

      // Crear el nuevo usuario usando el cliente aislado
      const { data, error } = await tempClient.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: { data: { full_name: userForm.name } }
      })
      if (error) throw error

      setUserMsg({ type: 'ok', text: `¡Usuario ${userForm.email} creado exitosamente!` })
      setUserForm({ email: '', password: '', name: '' })
    } catch (err) {
      // Traducir errores comunes de Supabase
      let msg = err.message
      if (msg.includes('already registered') || msg.includes('already been registered'))
        msg = 'Este correo ya está registrado. Usa otro correo.'
      else if (msg.includes('invalid email') || msg.includes('Invalid email'))
        msg = 'El formato del correo no es válido. Ej: usuario@correo.com'
      else if (msg.includes('Password should be at least'))
        msg = 'La contraseña debe tener mínimo 6 caracteres.'
      else if (msg.includes('Unable to validate email'))
        msg = 'No se pudo validar el correo electrónico. Verifica el formato.'
      setUserMsg({ type: 'err', text: msg })
    } finally {
      setUserLoading(false)
    }
  }

  const fetchVinyls = async () => {
    try {
      const { data, error } = await supabase
        .from('vinyls').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setVinyls(data || [])
    } catch (err) {
      console.error(err)
      alert('Error cargando vinilos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este vinilo?')) return
    try {
      const { error } = await supabase.from('vinyls').delete().eq('id', id)
      if (error) throw error
      setVinyls(vinyls.filter(v => v.id !== id))
    } catch (err) { alert('Error: ' + err.message) }
  }

  const openEdit = (vinyl) => {
    setEditingId(vinyl.id)
    setEditForm({
      title: vinyl.title || '',
      artist: vinyl.artist || '',
      price: vinyl.price || 0,
      year: vinyl.year || new Date().getFullYear(),
      type: vinyl.type || 'LP',
      availability: vinyl.availability || 'disponible',
      cover_url: vinyl.cover_url || '',
      description: vinyl.description || ''
    })
    setShowEdit(true)
  }

  // SSRF Protection / URL Validation
  const validateUrl = (urlStr) => {
    if (!urlStr) return true // Optional field
    try {
      const parsed = new URL(urlStr)
      if (parsed.protocol !== 'https:') return false
      const blocked = ['localhost', '127.0.0.1', '169.254']
      if (blocked.some(b => parsed.hostname.startsWith(b))) return false
      return true
    } catch {
      return false
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateUrl(createForm.cover_url)) {
      alert('Error de Seguridad: La URL de la portada debe ser HTTPS válida y no puede apuntar a direcciones locales.')
      return
    }
    try {
      const { data, error } = await supabase.from('vinyls').insert([createForm]).select()
      if (error) throw error
      setVinyls([data[0], ...vinyls])
      setShowCreate(false)
      setCreateForm({ ...EMPTY_FORM })
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!validateUrl(editForm.cover_url)) {
      alert('Error de Seguridad: La URL de la portada debe ser HTTPS válida y no puede apuntar a direcciones locales.')
      return
    }
    try {
      const { error } = await supabase
        .from('vinyls')
        .update({
          title: editForm.title,
          artist: editForm.artist,
          price: editForm.price,
          year: editForm.year,
          type: editForm.type,
          availability: editForm.availability,
          cover_url: editForm.cover_url,
          description: editForm.description
        })
        .eq('id', editingId)
      if (error) throw error
      setVinyls(vinyls.map(v => v.id === editingId ? { ...v, ...editForm } : v))
      setShowEdit(false)
      setEditingId(null)
    } catch (err) { alert('Error: ' + err.message) }
  }

  if (loading) return <div className="p-12 text-center text-gray">Cargando...</div>

  return (
    <div className="flex-1 p-10 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] tracking-[3px] uppercase text-[#8B7355] mb-1">Panel de Control</p>
            <h1 className="font-serif font-bold text-[38px] text-dark leading-tight">Administración</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-dark text-white px-5 py-2.5 text-[11px] tracking-[2px] uppercase hover:bg-warm transition-colors"
          >
            <Plus size={15} /> Nuevo Vinilo
          </button>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-gold-light/25 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark text-[10px] uppercase tracking-[2px] text-white/60">
              <th className="p-4 font-medium">Portada</th>
              <th className="p-4 font-medium">Título</th>
              <th className="p-4 font-medium">Artista</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium">Año</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vinyls.map(vinyl => (
              <tr key={vinyl.id} className="border-b border-gold-light/10 hover:bg-cream/40 transition-colors">
                <td className="p-4">
                  <img src={vinyl.cover_url} alt="cover" className="w-11 h-11 object-cover bg-dark" />
                </td>
                <td className="p-4">
                  <div className="font-serif text-dark text-sm">{vinyl.title}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs text-gold tracking-[1px] uppercase">{vinyl.artist}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-dark">${vinyl.price?.toLocaleString()}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs text-gray">{vinyl.year}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs text-gray">{vinyl.type}</div>
                </td>
                <td className="p-4">
                  <span className={`text-[9px] tracking-[1px] uppercase px-2 py-1 font-medium text-white ${
                    vinyl.availability === 'disponible' ? 'bg-green' :
                    vinyl.availability === 'preventa' ? 'bg-red' : 'bg-gray'
                  }`}>
                    {vinyl.availability}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(vinyl)}
                      className="p-2 text-gold hover:bg-gold/10 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(vinyl.id)}
                      className="p-2 text-red hover:bg-red/10 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vinyls.length === 0 && (
          <div className="p-16 text-center text-gray text-sm">No hay vinilos registrados.</div>
        )}
      </div>

      {/* Modales */}
      {showCreate && (
        <VinylModal
          title="Nuevo Vinilo"
          form={createForm}
          setForm={setCreateForm}
          onSubmit={handleCreate}
          onClose={() => { setShowCreate(false); setCreateForm({ ...EMPTY_FORM }) }}
        />
      )}

      {showEdit && (
        <VinylModal
          title="Editar Vinilo"
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleEdit}
          onClose={() => { setShowEdit(false); setEditingId(null) }}
        />
      )}

      {/* ---- Crear Usuario ---- */}
      <div className="mt-12 max-w-md">
        <div className="mb-5">
          <p className="text-[10px] tracking-[3px] uppercase text-[#8B7355] mb-1">Accesos</p>
          <h2 className="font-serif font-bold text-[28px] text-dark leading-tight">Crear Usuario</h2>
        </div>

        <form onSubmit={handleCreateUser} className="bg-white border border-gold-light/25 p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Nombre completo</label>
              <input
                type="text"
                value={userForm.name}
                onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="ej. Juan Pérez"
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Correo electrónico *</label>
              <input
                required type="email"
                value={userForm.email}
                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2.5 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[2px] uppercase text-gray mb-1.5 font-medium">Contraseña *</label>
              <div className="relative">
                <input
                  required type={showPassword ? 'text' : 'password'} minLength={6}
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 pr-10 border border-gold-light/40 outline-none text-sm focus:border-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark transition-colors"
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
          </div>

          {userMsg && (
            <div className={`mt-4 px-4 py-3 text-sm font-medium flex items-start gap-2.5 ${
              userMsg.type === 'ok'
                ? 'bg-green/10 text-green border-l-4 border-green'
                : 'bg-red/10 text-red border-l-4 border-red'
            }`}>
              <span className="mt-0.5 shrink-0 text-base">{userMsg.type === 'ok' ? '✓' : '✕'}</span>
              <span>{userMsg.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={userLoading}
            className="mt-5 w-full py-3 bg-dark text-white text-[11px] tracking-[2px] uppercase hover:bg-warm transition-colors disabled:opacity-50"
          >
            {userLoading ? 'Creando...' : 'Crear Usuario'}
          </button>

          <p className="mt-3 text-[11px] text-gray text-center">
            El usuario podrá iniciar sesión de inmediato. Para darle rol de admin, cámbialo en la tabla <code className="bg-cream px-1">profiles</code> de Supabase.
          </p>
        </form>
      </div>
    </div>
  )
}
