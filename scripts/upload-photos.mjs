import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  'https://xrliqesijaarsnnocpkj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybGlxZXNpamFhcnNubm9jcGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTEwNzcsImV4cCI6MjA5MTAyNzA3N30.GxS_dsU1IZDK7YAZ2GUFNbs4J7IpGCoCpT3PH8JGUbQ'
)

const PHOTO_DIR = 'C:\\Users\\leese\\OneDrive\\문서\\카카오톡 받은 파일\\조이조아\\4월 6일 간식바구니 만들기'
const ALBUM_TITLE = '4/6 간식봉사 모임'

async function main() {
  // 앨범 ID 조회
  const { data: albums } = await supabase.from('albums').select('id').eq('title', ALBUM_TITLE).limit(1)
  if (!albums || albums.length === 0) {
    console.log('앨범이 없습니다. seed_albums.sql을 먼저 실행해주세요.')
    return
  }
  const albumId = albums[0].id
  console.log(`앨범 ID: ${albumId}`)

  // 사진 파일 목록
  const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
  console.log(`업로드할 사진: ${files.length}장`)

  let success = 0
  for (const file of files) {
    const filePath = path.join(PHOTO_DIR, file)
    const fileBuffer = fs.readFileSync(filePath)
    const storagePath = `${albumId}/${file}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(storagePath, fileBuffer, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) {
      console.log(`❌ ${file}: ${uploadError.message}`)
      continue
    }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(storagePath)

    const { error: dbError } = await supabase.from('photos').insert({
      album_id: albumId,
      album_title: ALBUM_TITLE,
      image_url: urlData.publicUrl,
    })

    if (dbError) {
      console.log(`❌ DB ${file}: ${dbError.message}`)
    } else {
      success++
      console.log(`✅ ${file} (${success}/${files.length})`)
    }
  }

  console.log(`\n완료! ${success}/${files.length}장 업로드됨`)
}

main()
