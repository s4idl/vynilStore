#!/usr/bin/env node
/**
 * RUNNER MAESTRO — Ejecuta todos los PoC de auditoría
 * Proyecto: VynilStore (Groovehaus)
 * Auditor: Manuel
 * 
 * USO:
 *   node run_all_pocs.js
 * 
 * ANTES DE EJECUTAR:
 *   1. Configurar credenciales en cada poc_*.js
 *   2. Asegurarse que npm run dev está activo (para VUL-05)
 *   3. npm install @supabase/supabase-js (si no está instalado)
 */

import { execSync } from 'child_process'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const POCS = [
  {
    id: 'VUL-05',
    file: 'poc_vul05_security_headers.js',
    name: 'Security Headers (no requiere credenciales)',
    requiresCredentials: false
  },
  {
    id: 'VUL-07',
    file: 'poc_vul07_rls_vinyls.js',
    name: 'Broken Access Control en vinyls (requiere usuario normal)',
    requiresCredentials: true
  },
  {
    id: 'VUL-02',
    file: 'poc_vul02_profiles_rls.js',
    name: 'RLS en tabla profiles (requiere usuario normal)',
    requiresCredentials: true
  },
  {
    id: 'VUL-04',
    file: 'poc_vul04_url_injection.js',
    name: 'URL Injection / SSRF (requiere admin)',
    requiresCredentials: true
  },
  {
    id: 'VUL-01',
    file: 'poc_vul01_session_swap.js',
    name: 'Race Condition Session Swap (requiere admin)',
    requiresCredentials: true
  }
]

const BANNER = `
╔══════════════════════════════════════════════════════════╗
║        GROOVEHAUS — SUITE DE AUDITORÍA DE SEGURIDAD      ║
║              PoC Runner v1.0 | Auditor: Manuel           ║
╚══════════════════════════════════════════════════════════╝
`

console.log(BANNER)
console.log('Scripts disponibles:\n')

POCS.forEach((poc, i) => {
  const req = poc.requiresCredentials ? '🔑 Requiere credenciales' : '🌐 Sin credenciales'
  console.log(`  [${i + 1}] ${poc.id} — ${poc.name}`)
  console.log(`       ${req} | Archivo: ${poc.file}\n`)
})

console.log('─'.repeat(60))
console.log('Para ejecutar un PoC individual:')
console.log('  node audit/poc_vul05_security_headers.js')
console.log('  node audit/poc_vul02_profiles_rls.js')
console.log('  node audit/poc_vul07_rls_vinyls.js')
console.log('  node audit/poc_vul04_url_injection.js')
console.log('  node audit/poc_vul01_session_swap.js')
console.log('─'.repeat(60))

console.log('\n⚡ Ejecutando VUL-05 automáticamente (no requiere credenciales)...\n')

try {
  execSync(`node "${join(__dirname, 'poc_vul05_security_headers.js')}"`, { 
    stdio: 'inherit',
    cwd: __dirname
  })
} catch (e) {
  // Output ya fue mostrado via stdio:inherit
}

console.log(`
─────────────────────────────────────────────────────────
Para los demás PoC, edita los archivos y reemplaza:
  ADMIN_EMAIL    → tu email de admin
  ADMIN_PASSWORD → tu password de admin
  USER_EMAIL     → email de usuario normal  
  USER_PASSWORD  → password de usuario normal

Luego ejecuta cada script individualmente.
─────────────────────────────────────────────────────────
`)
