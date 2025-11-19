addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    // Log simple en Cloudflare
    console.log(`Request to: ${request.url}`)
  
    // Deja que el sitio estático sirva los archivos
    return await getAssetFromKV(event)
  }
  