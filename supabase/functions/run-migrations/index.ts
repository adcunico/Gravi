import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Migrations were applied on 2026-06-02. This function is now a no-op.
serve(() => new Response(JSON.stringify({ message: 'migrations already applied' }), {
  status: 410,
  headers: { 'Content-Type': 'application/json' },
}))
