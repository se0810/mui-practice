import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { loadMovies, sampleMovies, selectMovies, isMovie, STORAGE_KEY } from '../src/movies.ts'
const filters = { query: '', status: 'all', genre: 'all', sort: 'newest', favorites: false }
const storage = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => storage.get(key) ?? null } })
afterEach(() => storage.clear())
test('first use provides samples; an explicitly empty collection stays empty', () => {
  assert.equal(loadMovies().movies.length, 6)
  storage.set(STORAGE_KEY, '[]')
  assert.deepEqual(loadMovies(), { movies: [], error: '' })
})
test('corrupt, invalid or duplicate saved records stop automatic saving', () => {
  for (const raw of ['{', '{}', '[{}]', JSON.stringify([{ ...sampleMovies[0], rating: 7 }]), JSON.stringify([sampleMovies[0], sampleMovies[0]])]) {
    storage.set(STORAGE_KEY, raw)
    assert.ok(loadMovies().error)
    assert.equal(storage.get(STORAGE_KEY), raw)
  }
})
test('saved edits and ratings round trip', () => {
  const movies = [{ ...sampleMovies[0], title: '編集した映画', status: 'watching', rating: 3.5, favorite: false }]
  storage.set(STORAGE_KEY, JSON.stringify(movies))
  assert.deepEqual(loadMovies().movies, movies)
})
test('search normalizes width/case and searches title, director and notes', () => {
  for (const query of ['ｐｅｒｆｅｃｔ', 'ヴェンダース', '週末']) assert.equal(selectMovies(sampleMovies, { ...filters, query })[0].id, 'sample-3')
})
test('status, genre and favorite filters combine', () => {
  assert.deepEqual(selectMovies(sampleMovies, { ...filters, status: 'watched', genre: 'SF', favorites: true }).map(m => m.id), ['sample-1'])
  assert.equal(selectMovies(sampleMovies, { ...filters, status: 'planned', favorites: true }).length, 0)
})
test('all sort modes are deterministic without mutating source', () => {
  const original = sampleMovies.map(m => m.id)
  assert.equal(selectMovies(sampleMovies, { ...filters, sort: 'year' })[0].year, 2023)
  assert.equal(selectMovies(sampleMovies, { ...filters, sort: 'rating' })[0].rating, 5)
  const titles = selectMovies(sampleMovies, { ...filters, sort: 'title' }).map(m => m.title)
  assert.deepEqual(titles, [...titles].sort((a,b) => a.localeCompare(b,'ja')))
  assert.deepEqual(sampleMovies.map(m => m.id), original)
})
test('storage validation rejects out-of-range years and fractional ratings', () => {
  assert.equal(isMovie({ ...sampleMovies[0], year: 1887 }), false)
  assert.equal(isMovie({ ...sampleMovies[0], rating: 1.3 }), false)
  assert.equal(isMovie(sampleMovies[0]), true)
})
