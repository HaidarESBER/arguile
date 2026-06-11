import { vi } from "vitest";

// next/cache relies on Next's incremental-cache runtime, which doesn't exist
// under Vitest ("Invariant: incrementalCache missing"). Make unstable_cache a
// pass-through and the revalidate helpers no-ops so the data layer stays
// unit-testable.
vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
