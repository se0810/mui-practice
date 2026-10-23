export const STORAGE_KEY = 'movie-shelf:v1'
export const genres = ['SF', 'ドラマ', 'アニメ', 'アクション', 'コメディ', 'ホラー', '恋愛', 'ドキュメンタリー', 'その他']
export const statuses = { planned: '観たい', watching: '視聴中', watched: '鑑賞済み' }
export type Movie = { id: string; title: string; director: string; year: number; genre: string; status: keyof typeof statuses; rating: number; notes: string; favorite: boolean; createdAt: number }
export function emptyMovie(): Movie { return { id: crypto.randomUUID(), title: '', director: '', year: new Date().getFullYear(), genre: 'その他', status: 'planned', rating: 0, notes: '', favorite: false, createdAt: Date.now() } }
export const sampleMovies: Movie[] = [
  { id: 'sample-1', title: 'インターステラー', director: 'クリストファー・ノーラン', year: 2014, genre: 'SF', status: 'watched', rating: 5, notes: '宇宙の向こうにも、つながっているものがある。もう一度観たい一本。', favorite: true, createdAt: 6 },
  { id: 'sample-2', title: '千と千尋の神隠し', director: '宮﨑駿', year: 2001, genre: 'アニメ', status: 'watched', rating: 4.5, notes: '何度観ても、新しい発見がある。', favorite: true, createdAt: 5 },
  { id: 'sample-3', title: 'PERFECT DAYS', director: 'ヴィム・ヴェンダース', year: 2023, genre: 'ドラマ', status: 'planned', rating: 0, notes: '週末、ゆっくり観たい。', favorite: false, createdAt: 4 },
  { id: 'sample-4', title: 'ラ・ラ・ランド', director: 'デイミアン・チャゼル', year: 2016, genre: '恋愛', status: 'watching', rating: 0, notes: '', favorite: false, createdAt: 3 },
  { id: 'sample-5', title: 'マッドマックス 怒りのデス・ロード', director: 'ジョージ・ミラー', year: 2015, genre: 'アクション', status: 'watched', rating: 4, notes: '大きな画面でまた観たい。', favorite: false, createdAt: 2 },
  { id: 'sample-6', title: 'リトル・ミス・サンシャイン', director: 'ジョナサン・デイトン／ヴァレリー・ファリス', year: 2006, genre: 'コメディ', status: 'planned', rating: 0, notes: '', favorite: false, createdAt: 1 },
]
export function isMovie(value: unknown): value is Movie {
  if (!value || typeof value !== 'object') return false
  const m = value as Movie
  return typeof m.id === 'string' && !!m.id && typeof m.title === 'string' && !!m.title.trim() && typeof m.director === 'string' && Number.isInteger(m.year) && m.year >= 1888 && m.year <= 2100 && genres.includes(m.genre) && Object.hasOwn(statuses, m.status) && Number.isFinite(m.rating) && m.rating >= 0 && m.rating <= 5 && m.rating * 2 % 1 === 0 && typeof m.notes === 'string' && typeof m.favorite === 'boolean' && Number.isFinite(m.createdAt)
}
export function loadMovies(): { movies: Movie[]; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { movies: sampleMovies, error: '' }
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data) || !data.every(isMovie) || new Set(data.map(m => m.id)).size !== data.length) throw new Error('Invalid data')
    return { movies: data, error: '' }
  } catch { return { movies: [], error: '保存データを読み込めませんでした。既存データを保護するため自動保存を停止しています。「保存を再試行」を押すと現在の一覧で上書きします。' } }
}
export function selectMovies(movies: Movie[], filters: { query: string; status: string; genre: string; sort: string; favorites: boolean }) {
  const q = filters.query.trim().normalize('NFKC').toLocaleLowerCase('ja')
  return movies.filter(m => (!q || `${m.title} ${m.director} ${m.notes}`.normalize('NFKC').toLocaleLowerCase('ja').includes(q)) && (filters.status === 'all' || m.status === filters.status) && (filters.genre === 'all' || m.genre === filters.genre) && (!filters.favorites || m.favorite)).sort((a, b) => {
    if (filters.sort === 'title') return a.title.localeCompare(b.title, 'ja')
    if (filters.sort === 'rating') return b.rating - a.rating || b.createdAt - a.createdAt
    if (filters.sort === 'year') return b.year - a.year || b.createdAt - a.createdAt
    return b.createdAt - a.createdAt
  })
}
