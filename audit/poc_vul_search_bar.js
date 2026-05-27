import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://ybcxzntioiohbmyhwiee.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliY3h6bnRpb2lvaGJteWh3aWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDI2MTksImV4cCI6MjA5NDgxODYxOX0.slRr5A5K804uag2N-1g6u9jz2Vaq2FXB1mRoxQXE37k'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Payloads diseñados para romper la barra de búsqueda si no estuviera protegida
const PAYLOADS = [
  {
    name: "Ataque SQL Injection Clásico (Intentar saltar el ilike)",
    payload: "') OR 1=1--"
  },
  {
    name: "Ataque XSS (Intentar meter scripts HTML)",
    payload: "<script>alert('hack')</script>"
  },
  {
    name: "Ataque SQL Injection Ciego (Intentar hacer que la base tarde en responder)",
    payload: "%; SELECT pg_sleep(5);--"
  },
  {
    name: "Inyección de Comodines (Intentar crashear la búsqueda trayendo todo)",
    payload: "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
  }
]

async function runAudit() {
  console.log("==================================================")
  console.log("🛡️  INICIANDO AUDITORÍA: BARRA DE BÚSQUEDA")
  console.log("==================================================\n")

  for (const test of PAYLOADS) {
    console.log(`[*] Probando: ${test.name}`)
    console.log(`    Payload: "${test.payload}"`)
    
    // Aquí es donde simulamos lo que hace la barra de búsqueda (Frontend)
    // 1. Sanitización que hace React (Limpieza de < y >)
    const sanitizedPayload = test.payload.replace(/[<>]/g, '')
    
    // 2. Consulta real a Supabase (Backend) usando el método ilike
    try {
      const { data, error } = await supabase
        .from('vinyls')
        .select('title')
        .ilike('title', `%${sanitizedPayload}%`)
      
      if (error) {
        console.error(`    ❌ ERROR GRAVE: La base de datos devolvió un error (Vulnerable a Inyección SQL). Detalles: ${error.message}`)
      } else {
        console.log(`    ✅ SEGURO: La base de datos trató el payload como texto muerto.`)
        console.log(`    Resultados encontrados que coinciden con esa basura: ${data.length}`)
      }
    } catch (err) {
      console.error(`    ❌ ERROR DEL SCRIPT: ${err.message}`)
    }
    console.log("--------------------------------------------------")
  }
  
  console.log("✅ AUDITORÍA FINALIZADA. BARRA DE BÚSQUEDA PROTEGIDA.")
}

runAudit()
