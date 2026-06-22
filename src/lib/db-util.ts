/**
 * Normalizes db.execute() result across drivers:
 * - drizzle/postgres-js  → returns a RowList (Array subclass)
 * - drizzle/node-postgres → returns pg QueryResult { rows: [...] }
 * - drizzle/neon-http    → returns array directly
 */
export function ser(result: unknown): any[] {
  if (result == null) return []
  // pg QueryResult has a .rows property
  if (!Array.isArray(result) && typeof result === "object" && "rows" in (result as any)) {
    const rows = (result as any).rows
    return Array.isArray(rows) ? rows : []
  }
  if (Array.isArray(result)) return result as any[]
  return []
}

export function ser1(result: unknown): any {
  return ser(result)[0] ?? null
}