import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  try {
    // 1차: OG 메타 태그 시도
    let title = '', author = '', description = '', image = ''
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        redirect: 'follow',
      })
      const html = await res.text()

      const og = (name: string) => {
        const m = html.match(new RegExp(`og:${name}["'][^>]+content=["']([^"']+)`, 'i'))
          || html.match(new RegExp(`content=["']([^"']+)["'][^>]+og:${name}`, 'i'))
        return m?.[1] ?? ''
      }
      title = og('title') || html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || ''
      image = og('image')
      description = og('description')
      author = og('article:author')

      // 제목에서 사이트명 제거
      title = title.replace(/\s*[-|]\s*(교보문고|YES24|알라딘|인터파크|영풍문고).*$/i, '').trim()
    } catch { /* OG 실패 시 넘어감 */ }

    // 2차: OG에서 제목을 못 가져왔거나 이미지가 없으면 Google Books로 검색
    if (!image || !title) {
      // URL에서 책 제목 힌트 추출
      let searchQuery = title
      if (!searchQuery) {
        // URL 파라미터에서 추출 시도
        const urlObj = new URL(url)
        searchQuery = urlObj.searchParams.get('keyword') || urlObj.searchParams.get('query') || ''
      }
      if (!searchQuery) {
        // 제목 없으면 URL 자체로는 검색 불가
        return NextResponse.json({ title: '', author: '', description: '', thumbnail: '', url, error: 'Could not extract book info' })
      }

      const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1&printType=books`)
      const gData = await gRes.json()
      if (gData.items?.[0]) {
        const info = gData.items[0].volumeInfo
        title = title || info.title || ''
        author = author || (info.authors ?? []).join(', ')
        description = description || (info.description ?? '').slice(0, 200)
        image = image || info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
      }
    }

    return NextResponse.json({
      title, author, description, thumbnail: image, url,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed', detail: String(e) }, { status: 500 })
  }
}
