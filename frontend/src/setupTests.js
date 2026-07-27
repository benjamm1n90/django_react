import '@testing-library/jest-dom'

class MemoryStorage {
  constructor() {
    this._data = new Map()
  }
  get length() {
    return this._data.size
  }
  clear() {
    this._data.clear()
  }
  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null
  }
  key(index) {
    return Array.from(this._data.keys())[index] ?? null
  }
  removeItem(key) {
    this._data.delete(key)
  }
  setItem(key, value) {
    this._data.set(key, String(value))
  }
}

function installMemoryStorage(target, propertyName) {
  Object.defineProperty(target, propertyName, {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}

// Node 22+ ships a built-in, file/SQLite-backed `localStorage` global that
// recent jsdom versions delegate to. Without a configured file it's
// non-functional (missing methods like `.clear()`), and even with one,
// concurrent Vitest test files racing on the same file throw
// "database is locked". Replace it with a simple in-memory Storage
// polyfill, scoped to this test process, so tests don't depend on it.
installMemoryStorage(globalThis, 'localStorage')
installMemoryStorage(globalThis, 'sessionStorage')
if (typeof window !== 'undefined') {
  installMemoryStorage(window, 'localStorage')
  installMemoryStorage(window, 'sessionStorage')
}
