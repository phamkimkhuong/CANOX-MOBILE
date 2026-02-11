/**
 * Semver Utility - Lightweight semver comparison
 *
 * Provides basic semantic versioning comparison without
 * needing the full `semver` npm package (~75KB).
 * Only supports standard `major.minor.patch` format.
 *
 * @example
 * compareSemver('1.2.3', '1.3.0') // => -1 (left < right)
 * compareSemver('2.0.0', '1.9.9') // => 1  (left > right)
 * compareSemver('1.0.0', '1.0.0') // => 0  (equal)
 *
 * isLowerThan('1.0.0', '1.1.0')   // => true
 */

/**
 * Parse a semver string into numeric parts.
 * Returns [0, 0, 0] for invalid input (safe fallback).
 */
function parseSemver(version: string): [number, number, number] {
    const parts = version
        .replace(/^v/, '') // Strip leading 'v' (e.g., "v1.2.3")
        .split('.')
        .map(Number);

    return [
        Number.isFinite(parts[0]) ? parts[0] : 0,
        Number.isFinite(parts[1]) ? parts[1] : 0,
        Number.isFinite(parts[2]) ? parts[2] : 0,
    ];
}

/**
 * Compare two semver strings.
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
    const [aMajor, aMinor, aPatch] = parseSemver(a);
    const [bMajor, bMinor, bPatch] = parseSemver(b);

    if (aMajor !== bMajor) return aMajor < bMajor ? -1 : 1;
    if (aMinor !== bMinor) return aMinor < bMinor ? -1 : 1;
    if (aPatch !== bPatch) return aPatch < bPatch ? -1 : 1;

    return 0;
}

/**
 * Check if version `a` is strictly lower than version `b`.
 */
export function isLowerThan(a: string, b: string): boolean {
    return compareSemver(a, b) === -1;
}
