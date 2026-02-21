export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (url.searchParams.has('url')) {
      const target = url.searchParams.get('url')

      const allowed = [
        'https://i1.nhentaiclub.shop/',
        'https://i2.nhentaiclub.shop/',
        'https://i3.nhentaiclub.shop/',
      ]
      if (!allowed.some(prefix => target.startsWith(prefix))) {
        return new Response('Invalid URL', { status: 400 })
      }

      const response = await fetch(target, {
        headers: {
          'Referer': 'https://nhentaiclub.space',
          'User-Agent': request.headers.get('User-Agent') ?? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          'Cookie': request.headers.get('Cookie') ?? '',
          'cf-clearance': request.headers.get('cf-clearance') ?? '',
        }
      })

      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        }
      })
    }

    return new Response('Not found', { status: 404 })
  }
}