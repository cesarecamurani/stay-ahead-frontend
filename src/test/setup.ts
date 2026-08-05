import '@testing-library/jest-dom/vitest'

class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>()

  get length() {
    return this.items.size
  }

  clear() {
    this.items.clear()
  }

  getItem(key: string) {
    return this.items.get(String(key)) ?? null
  }

  key(index: number) {
    return Array.from(this.items.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.items.delete(String(key))
  }

  setItem(key: string, value: string) {
    this.items.set(String(key), String(value))
  }
}

// Node 25+ exposes an experimental localStorage global that can mask jsdom's
// implementation. Use a deterministic Storage implementation in every test.
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
})
