import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JoyJoaBot/1.0)' },
    })
    const html = await res.text()

    // OG 메타 태그 추출
    const og = (name: string) => {
      const match = html.match(new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["']`, 'i'))
      return match?.[1] ?? ''
    }

    // 일반 메타 태그 fallback
    const meta = (name: string) => {
      const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'))
      return match?.[1] ?? ''
    }

    // 제목에서 작가명 분리 시도 (예: "책제목 - 작가명")
    const rawTitle = og('title') || html.match(/<title>([^<]+)<\/title>/i)?.[1] || ''
    const image = og('image') || ''
    const description = og('description') || meta('description') || ''
    const author = og('article:author') || meta('author') || ''
    const siteName = og('site_name') || ''

    // 알라딘/교보/YES24 등에서 작가명 추출 시도
    let title = rawTitle
    let extractedAuthor = author
    if (!extractedAuthor) {
      // "책제목 | 작가명 - 사이트명" 패턴
      const parts = rawTitle.split(/[|\-–]/).map(s => s.trim())
      if (parts.length >= 2) {
        title = parts[0]
        if (!author) extractedAuthor = parts[1]
      }
    }

    return NextResponse.json({
      title: title.trim(),
      author: extractedAuthor.trim(),
      description: description.slice(0, 200).trim(),
      thumbnail: image,
      siteName,
      url,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch URL', detail: String(e) }, { status: 500 })
  }
}
