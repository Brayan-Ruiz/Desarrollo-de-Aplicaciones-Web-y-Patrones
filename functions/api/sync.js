/**
 * Cloudflare Pages Function: /api/sync
 * Endpoint opcional sin servidor (Edge Serverless) para sincronizar datos con Cloudflare KV o D1.
 * Funciona en el Free Tier de Cloudflare Pages / Workers.
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  // Si se tiene configurado un enlace KV (ej. FINANCES_KV)
  if (env.FINANCES_KV) {
    const data = await env.FINANCES_KV.get('user_state');
    if (data) {
      return new Response(data, {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // Respuesta predeterminada de estado saludable del endpoint
  return new Response(JSON.stringify({
    status: 'ok',
    edge: 'Cloudflare Pages / Workers Edge',
    timestamp: new Date().toISOString(),
    message: 'Servicio de sincronización activo en Cloudflare Edge.'
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await request.json();

    if (env.FINANCES_KV) {
      await env.FINANCES_KV.put('user_state', JSON.stringify(payload));
      return new Response(JSON.stringify({ success: true, message: 'Datos guardados en Cloudflare KV' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Recibido en el borde de Cloudflare (Modo Cliente / LocalStorage activo).'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
