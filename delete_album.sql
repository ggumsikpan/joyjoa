-- "작가님들 책표지만 좀 올려주세요" 앨범 삭제
-- photos 테이블의 album_id에 ON DELETE CASCADE가 걸려있어서
-- 앨범을 지우면 연결된 사진 레코드도 자동으로 함께 삭제됩니다.
-- (Storage 버킷의 실제 이미지 파일은 별도로 정리 필요)

DELETE FROM albums WHERE title = '작가님들 책표지만 좀 올려주세요';
