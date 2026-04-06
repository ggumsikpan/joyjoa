import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ items: [] })

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&langRestrict=ko&printType=books`
  )
  const data = await res.json()

  const items = (data.items ?? []).map((item: Record<string, unknown>) => {
    const info = item.volumeInfo as Record<string, unknown>
    const imageLinks = info.imageLinks as Record<string, string> | undefined
    return {
      id: item.id,
      title: info.title ?? '',
      authors: (info.authors as string[]) ?? [],
      publisher: info.publisher ?? '',
      publishedDate: info.publishedDate ?? '',
      description: ((info.description as string) ?? '').slice(0, 100),
      thumbnail: imageLinks?.thumbnail ?? imageLinks?.smallThumbnail ?? '',
      link: info.infoLink ?? '',
    }
  })

  return NextResponse.json({ items })
}
