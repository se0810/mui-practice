import { useMemo, useState } from 'react'
import { Alert, AppBar, Autocomplete, Avatar, Box, Button, Card, CardActions, CardContent, Chip, Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, LinearProgress, MenuItem, Pagination, Paper, Rating, Select, Snackbar, Stack, Switch, Tab, Tabs, TextField, ThemeProvider, Toolbar, Tooltip, Typography, createTheme } from '@mui/material'
import type { Movie } from './movies'
import { emptyMovie, genres, loadMovies, selectMovies, statuses, STORAGE_KEY } from './movies'
import './App.css'

const theme = createTheme({ palette: { mode: 'dark', primary: { main: '#c8ed86' }, background: { default: '#101411', paper: '#1b211c' } }, typography: { fontFamily: '"Segoe UI", "Noto Sans JP", sans-serif', button: { textTransform: 'none', fontWeight: 700 } }, shape: { borderRadius: 16 } })

export default function App() {
  const [initial] = useState(loadMovies)
  const [movies, setMovies] = useState<Movie[]>(initial.movies)
  const [storageError, setStorageError] = useState(initial.error)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [genre, setGenre] = useState('all')
  const [sort, setSort] = useState('newest')
  const [favorites, setFavorites] = useState(false)
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<Movie | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState<Movie | null>(null)
  const [notice, setNotice] = useState('')
  // Persist from user events so write failures can be reported immediately.
  const commitMovies = (change: (all: Movie[]) => Movie[]) => {
    const next = change(movies)
    setMovies(next)
    if (storageError) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }
    catch { setStorageError('保存できません。ブラウザーの保存容量・設定を確認してください。現在の変更は画面内のみ有効です。') }
  }
  const retryStorage = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(movies)); setStorageError(''); setNotice('保存しました') }
    catch { setStorageError('保存できません。ブラウザーの保存容量・設定を確認してください。') }
  }
  const filtered = useMemo(() => selectMovies(movies, { query, status, genre, sort, favorites }), [movies, query, status, genre, sort, favorites])
  const pages = Math.max(1, Math.ceil(filtered.length / 6))
  const currentPage = Math.min(page, pages)
  const watched = movies.filter(m => m.status === 'watched')
  const rated = movies.filter(m => m.rating > 0)
  const average = rated.length ? (rated.reduce((n, m) => n + m.rating, 0) / rated.length).toFixed(1) : '—'
  const update = (movie: Movie) => commitMovies(all => all.map(m => m.id === movie.id ? movie : m))
  const open = (movie: Movie) => { setErrors({}); setDraft({ ...movie }) }
  const save = () => {
    if (!draft) return
    const next: Record<string, string> = {}
    if (!draft.title.trim()) next.title = 'タイトルを入力してください'
    if (!Number.isInteger(draft.year) || draft.year < 1888 || draft.year > 2100) next.year = '1888〜2100年で入力してください'
    setErrors(next)
    if (Object.keys(next).length) return
    const value = { ...draft, title: draft.title.trim(), director: draft.director.trim(), notes: draft.notes.trim() }
    commitMovies(all => all.some(m => m.id === value.id) ? all.map(m => m.id === value.id ? value : m) : [value, ...all])
    setDraft(null); setNotice('映画を保存しました')
  }
  return <ThemeProvider theme={theme}><CssBaseline />
    <AppBar position="static" elevation={0} color="transparent" sx={{ borderBottom: '1px solid #30382e' }}><Toolbar sx={{ gap: 2 }}><Avatar sx={{ bgcolor: 'primary.main', color: '#182113', fontWeight: 900 }}>M</Avatar><Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>MOVIE SHELF</Typography><Chip label="あなた専用の映画ノート" variant="outlined" sx={{ display: { xs: 'none', sm: 'flex' } }} /></Toolbar></AppBar>
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: "space-between", alignItems: { sm: 'center' }, gap: 3, mb: 4 }}><Box><Typography variant="overline" color="primary">YOUR PERSONAL CINEMA</Typography><Typography component="h1" variant="h3" sx={{ fontWeight: 800,  fontSize: { xs: 32, md: 44 } }}>映画を、思い出に。</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>観たい作品も、忘れたくない一本も。あなただけの棚に。</Typography></Box><Button variant="contained" size="large" onClick={() => open(emptyMovie())}>＋ 映画を登録</Button></Stack>
      {storageError && <Alert severity="warning" sx={{ mb: 3 }} action={<Button color="inherit" onClick={retryStorage}>保存を再試行</Button>}>{storageError}</Alert>}
      <Box className="stats"><Paper variant="outlined" sx={{ p: 3 }}><Typography color="text.secondary">コレクション</Typography><Typography variant="h3" sx={{ mt: 1 }}>{movies.length}<Typography component="span" color="text.secondary"> 本</Typography></Typography></Paper><Paper variant="outlined" sx={{ p: 3 }}><Typography color="text.secondary">鑑賞済み</Typography><Typography variant="h3" sx={{ mt: 1 }}>{watched.length}<Typography component="span" color="text.secondary"> 本</Typography></Typography><LinearProgress aria-label="鑑賞率" variant="determinate" value={movies.length ? watched.length / movies.length * 100 : 0} sx={{ mt: 2, borderRadius: 3 }} /></Paper><Paper variant="outlined" sx={{ p: 3 }}><Typography color="text.secondary">平均評価</Typography><Typography variant="h3" sx={{ mt: 1 }}>{average}<Typography component="span" color="primary"> ★</Typography></Typography></Paper></Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, my: 3 }}>
        <Tabs value={status} onChange={(_, v) => { setStatus(v); setPage(1) }} variant="scrollable" allowScrollButtonsMobile aria-label="視聴状況"><Tab value="all" label={`すべて (${movies.length})`} />{Object.entries(statuses).map(([key, label]) => <Tab key={key} value={key} label={`${label} (${movies.filter(m => m.status === key).length})`} />)}</Tabs><Divider sx={{ mb: 3 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}><TextField label="映画を検索" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="タイトル・監督・メモ" sx={{ flex: 1 }} slotProps={{ input: { startAdornment: <InputAdornment position="start">⌕</InputAdornment> } }} /><FormControl sx={{ minWidth: 150 }}><InputLabel id="genre-label">ジャンル</InputLabel><Select labelId="genre-label" label="ジャンル" value={genre} onChange={e => { setGenre(e.target.value); setPage(1) }}><MenuItem value="all">すべて</MenuItem>{genres.map(g => <MenuItem value={g} key={g}>{g}</MenuItem>)}</Select></FormControl><FormControl sx={{ minWidth: 170 }}><InputLabel id="sort-label">並べ替え</InputLabel><Select labelId="sort-label" label="並べ替え" value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>{[['newest', '登録が新しい順'], ['title', 'タイトル順'], ['rating', '評価が高い順'], ['year', '公開年が新しい順']].map(([v, l]) => <MenuItem value={v} key={v}>{l}</MenuItem>)}</Select></FormControl></Stack>
        <FormControlLabel control={<Switch checked={favorites} onChange={e => { setFavorites(e.target.checked); setPage(1) }} />} label="お気に入りだけ表示" sx={{ mt: 1 }} />
      </Paper>
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 2 }}><Typography variant="h6">マイライブラリー</Typography><Typography color="text.secondary">{filtered.length} 本</Typography></Stack>
      {filtered.length === 0 ? <Paper variant="outlined" sx={{ py: 8, textAlign: 'center' }}><Typography variant="h5">{movies.length ? '条件に合う映画がありません' : '最初の一本を登録しましょう'}</Typography><Typography color="text.secondary" sx={{ my: 2 }}>{movies.length ? '検索語や絞り込みを変えてみてください。' : '観たい映画や、心に残った作品を追加できます。'}</Typography><Button onClick={() => { setQuery(''); setStatus('all'); setGenre('all'); setFavorites(false); if (!movies.length) open(emptyMovie()) }}>{movies.length ? '検索条件をクリア' : '映画を登録'}</Button></Paper> : <Box className="movie-grid">{filtered.slice((currentPage - 1) * 6, currentPage * 6).map(movie => <Card key={movie.id} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box className="movie-art" sx={{ background: `linear-gradient(135deg, ${genreColor(movie.genre)}, #19221e)` }}><Typography className="art-year">{movie.year}</Typography><Typography className="art-title">{movie.title}</Typography><Tooltip title={movie.favorite ? 'お気に入りを解除' : 'お気に入りに追加'}><IconButton aria-label={`${movie.title}のお気に入り`} aria-pressed={movie.favorite} onClick={() => update({ ...movie, favorite: !movie.favorite })} sx={{ position: 'absolute', right: 12, top: 12, bgcolor: '#10141199', color: movie.favorite ? '#c8ed86' : 'white' }}>{movie.favorite ? '♥' : '♡'}</IconButton></Tooltip></Box>
        <CardContent sx={{ flex: 1 }}><Stack direction="row" sx={{ gap: 1, mb: 2 }}><Chip size="small" label={movie.genre} variant="outlined" /><Chip size="small" label={statuses[movie.status]} color={movie.status === 'watched' ? 'primary' : 'default'} /></Stack><Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>{movie.title}</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>{movie.year} · {movie.director || '監督未登録'}</Typography><Rating name={`rating-${movie.id}`} value={movie.rating} precision={0.5} onChange={(_, value) => update({ ...movie, rating: value ?? 0 })} sx={{ mt: 2 }} getLabelText={v => `${v}つ星`} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{movie.notes || 'まだメモはありません。'}</Typography></CardContent><Divider /><CardActions sx={{ justifyContent: 'space-between', px: 2 }}><Button size="small" onClick={() => open(movie)}>編集する</Button><Tooltip title="映画を削除"><IconButton aria-label={`${movie.title}を削除`} onClick={() => setDeleting(movie)}>×</IconButton></Tooltip></CardActions>
      </Card>)}</Box>}
      {pages > 1 && <Stack sx={{ alignItems: "center", mt: 4 }}><Pagination count={pages} page={currentPage} onChange={(_, value) => setPage(value)} color="primary" /></Stack>}
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 5 }}>MOVIE SHELF · データはこのブラウザーに保存されます</Typography>
    </Container>
    <Dialog open={!!draft} onClose={() => setDraft(null)} fullWidth maxWidth="sm"><Box component="form" onSubmit={e => { e.preventDefault(); save() }}><DialogTitle>{movies.some(m => m.id === draft?.id) ? '映画を編集' : '新しい映画を登録'}</DialogTitle><DialogContent>{draft && <Stack sx={{ gap: 3,  pt: 1 }}><TextField autoFocus required label="タイトル" value={draft.title} error={!!errors.title} helperText={errors.title} onChange={e => setDraft({ ...draft, title: e.target.value })} slotProps={{ htmlInput: { maxLength: 120 } }} /><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}><TextField type="number" required label="公開年" value={draft.year || ''} error={!!errors.year} helperText={errors.year} onChange={e => setDraft({ ...draft, year: Number(e.target.value) })} slotProps={{ htmlInput: { min: 1888, max: 2100 } }} /><TextField label="監督" value={draft.director} onChange={e => setDraft({ ...draft, director: e.target.value })} slotProps={{ htmlInput: { maxLength: 120 } }} /></Stack><Autocomplete options={genres} value={draft.genre} disableClearable onChange={(_, value) => setDraft({ ...draft, genre: value })} renderInput={params => <TextField {...params} label="ジャンル" />} /><TextField select label="視聴状況" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Movie['status'] })}>{Object.entries(statuses).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}</TextField><Box><Typography component="legend" sx={{ mb: 1 }}>あなたの評価（0〜5）</Typography><Rating value={draft.rating} precision={0.5} onChange={(_, v) => setDraft({ ...draft, rating: v ?? 0 })} getLabelText={v => `${v}つ星`} /><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{draft.rating || '未評価'}</Typography></Box><TextField multiline minRows={3} label="感想・メモ" value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} slotProps={{ htmlInput: { maxLength: 2000 } }} /><FormControlLabel control={<Switch checked={draft.favorite} onChange={e => setDraft({ ...draft, favorite: e.target.checked })} />} label="お気に入りに追加" /></Stack>}</DialogContent><DialogActions sx={{ p: 3 }}><Button onClick={() => setDraft(null)}>キャンセル</Button><Button type="submit" variant="contained">保存する</Button></DialogActions></Box></Dialog>
    <Dialog open={!!deleting} onClose={() => setDeleting(null)} aria-labelledby="delete-title"><DialogTitle id="delete-title">映画を削除しますか？</DialogTitle><DialogContent><DialogContentText>「{deleting?.title}」と評価・メモを削除します。この操作は取り消せません。</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleting(null)}>キャンセル</Button><Button color="error" onClick={() => { commitMovies(all => all.filter(m => m.id !== deleting?.id)); setDeleting(null); setNotice('映画を削除しました') }}>削除する</Button></DialogActions></Dialog>
    <Snackbar open={!!notice} autoHideDuration={3000} onClose={() => setNotice('')}><Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
  </ThemeProvider>
}
function genreColor(genre: string) { return ({ 'SF': '#3e596e', 'ドラマ': '#695046', 'アニメ': '#536b49', 'アクション': '#755039', 'コメディ': '#6d613c', 'ホラー': '#5a405c', '恋愛': '#754b60', 'ドキュメンタリー': '#3e6663' } as Record<string, string>)[genre] || '#4b5965' }
