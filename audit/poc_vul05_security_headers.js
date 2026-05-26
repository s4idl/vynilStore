/**
 * PoC — VUL-05: Ausencia de Content Security Policy
 * Proyecto: VynilStore (Groovehaus)
 * Auditor: Manuel
 * 
 * OBJETIVO: Verificar headers de seguridad HTTP faltantes.
 * Este script hace requests al servidor de desarrollo y analiza
 * los response headers para detectar configuraciones inseguras.
 * 
 * PREREQUISITOS:
 *   - App corriendo en localhost:5173 (npm run dev)
 * 
 * USO:
 *   node poc_vul05_security_headers.js
 */

const DEV_SERVER = 'http://localhost:5173'

// Headers de seguridad esperados
const SECURITY_HEADERS = [
  {
    header: 'content-security-policy',
    name: 'Content-Security-Policy (CSP)',
    critical: true,
    impact: 'Sin CSP, cualquier XSS puede ejecutar scripts arbitrarios'
  },
  {
    header: 'x-frame-options',
    name: 'X-Frame-Options',
    critical: true,
    impact: 'Sin esto, la app puede ser embebida en iframes (Clickjacking)'
  },
  {
    header: 'x-content-type-options',
    name: 'X-Content-Type-Options',
    critical: false,
    impact: 'Sin "nosniff", el browser puede hacer MIME sniffing malicioso'
  },
  {
    header: 'strict-transport-security',
    name: 'Strict-Transport-Security (HSTS)',
    critical: false,
    impact: 'Sin HSTS, posible downgrade a HTTP en producción'
  },
  {
    header: 'referrer-policy',
    name: 'Referrer-Policy',
    critical: false,
    impact: 'Sin esto, URLs internas pueden filtrarse a terceros via Referer'
  },
  {
    header: 'permissions-policy',
    name: 'Permissions-Policy',
    critical: false,
    impact: 'Sin esto, scripts tienen acceso sin restricciones a APIs del browser'
  },
  {
    header: 'cross-origin-opener-policy',
    name: 'Cross-Origin-Opener-Policy (COOP)',
    critical: false,
    impact: 'Riesgo de ataques Spectre/timing si no está configurado'
  }
]

async function runPoC() {
  console.log('='.repeat(60))
  console.log('PoC VUL-05 — Auditoría de Security Headers HTTP')
  console.log('='.repeat(60))
  console.log(`\nTarget: ${DEV_SERVER}\n`)

  let res
  try {
    res = await fetch(DEV_SERVER)
  } catch (err) {
    console.error(`❌ No se pudo conectar a ${DEV_SERVER}`)
    console.error('   Asegúrate de que "npm run dev" está corriendo.')
    process.exit(1)
  }

  console.log(`Status: ${res.status} ${res.statusText}`)
  console.log('\n[ANÁLISIS DE HEADERS DE SEGURIDAD]\n')

  let missing = 0
  let critical = 0

  for (const check of SECURITY_HEADERS) {
    const value = res.headers.get(check.header)
    const present = !!value

    if (present) {
      console.log(`   ✅ ${check.name}`)
      console.log(`      Valor: ${value}`)
    } else {
      console.log(`   ${check.critical ? '🔴' : '🟡'} AUSENTE — ${check.name}`)
      console.log(`      Impacto: ${check.impact}`)
      missing++
      if (check.critical) critical++
    }
  }

  // Mostrar TODOS los headers recibidos
  console.log('\n[HEADERS RECIBIDOS EN LA RESPUESTA]')
  for (const [key, value] of res.headers.entries()) {
    console.log(`   ${key}: ${value}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log(`RESUMEN: ${missing} headers de seguridad faltantes (${critical} críticos)`)

  if (critical > 0) {
    console.log('\n🔴 ACCIÓN REQUERIDA: Añadir headers críticos en vite.config.js')
    console.log(`
// vite.config.js — Configuración recomendada:
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' https: data: blob:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-ancestors 'none'"
      ].join('; ')
    }
  }
})
`)
  } else {
    console.log('\n✅ Todos los headers críticos están presentes.')
  }
}

runPoC().catch(console.error)
