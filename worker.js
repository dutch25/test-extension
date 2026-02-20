export default {
  async fetch(request) {
    const url = new URL(request.url)

    // ── Proxy endpoint ──────────────────────────────────────────────
    // Usage: https://your-worker.workers.dev/?url=https://i1.nhentaiclub.shop/...
    if (url.searchParams.has('url')) {
      const target = url.searchParams.get('url')

      if (!target.startsWith('https://i1.nhentaiclub.shop/')) {
        return new Response('Invalid URL', { status: 400 })
      }

      const response = await fetch(target, {
        headers: {
          'Referer': 'https://nhentaiclub.space',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      })

      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        }
      })
    }

    // ── Page count endpoint ─────────────────────────────────────────
    // Usage: https://your-worker.workers.dev/count?comicId=8853465&chapter=1&lang=VI
    if (url.pathname === '/count') {
      const comicId = url.searchParams.get('comicId')
      const lang    = url.searchParams.get('lang') ?? 'VI'
      const chapter = url.searchParams.get('chapter')

      if (!comicId || !chapter) {
        return new Response('Missing params', { status: 400 })
      }

      let count = 0
      for (let i = 1; i <= 100; i++) {
        const imgUrl = `https://i1.nhentaiclub.shop/${comicId}/${lang}/${chapter}/${i}.jpg`
        const res = await fetch(imgUrl, {
          method: 'HEAD',
          headers: { 'Referer': 'https://nhentaiclub.space' }
        })
        if (res.status === 404 || res.status === 403) break
        count = i
      }

      return new Response(JSON.stringify({ count }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Not found', { status: 404 })
  }
}
