export default {
  async fetch(request) {
    const url = new URL(request.url)
    const target = url.searchParams.get('url')
    if (!target || (!target.includes('nhentaiclub.shop') && !target.includes('nhentaiclub.space'))) {
      return new Response('Invalid URL', { status: 400 })
    }

    try {
      // Fetch with comprehensive headers to try to bypass Cloudflare
      const response = await fetch(target, {
        method: 'GET',
        headers: {
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://nhentaiclub.space/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-site',
        },
      })

      if (!response.ok && response.status === 403) {
        return new Response('Cloudflare blocked', { status: 403 })
      }

      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } catch (error) {
      return new Response('Proxy Error: ' + error.message, { status: 500 })
    }
  }
}
