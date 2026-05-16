/**
 * Reads a required environment variable or returns the provided fallback value.
 *
 * @param key - Environment variable name.
 * @param fallbackValue - Value used when the variable is unset.
 * @returns Trimmed environment variable value.
 * @throws When the variable is unset and no fallback value was provided.
 */
export function getEnv(key: string, fallbackValue?: string): string {
  const value = process.env[key]?.trim();

  if (value !== undefined && value.length > 0) {
    return value;
  }

  if (fallbackValue !== undefined) {
    return fallbackValue;
  }

  throw new Error(`Environment variable "${key}" is required.`);
}

/**
 * Reads a numeric environment variable and validates that it is a safe integer.
 *
 * @param key - Environment variable name.
 * @param fallbackValue - Optional fallback used when the variable is unset.
 * @returns Parsed integer value.
 * @throws When the environment value is not a safe integer.
 */
export function getIntegerEnv(key: string, fallbackValue?: number): number {
  const fallback = fallbackValue !== undefined ? String(fallbackValue) : undefined;
  const value = Number(getEnv(key, fallback));

  if (!Number.isSafeInteger(value)) {
    throw new Error(`Environment variable "${key}" must be a safe integer.`);
  }

  return value;
}
