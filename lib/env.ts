export class MissingEnvironmentVariablesError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Missing required environment variables: ${missing.join(", ")}`);
    this.name = "MissingEnvironmentVariablesError";
    this.missing = missing;
  }
}

export function getRequiredEnvValues<T extends readonly string[]>(
  names: T
): Record<T[number], string> {
  const missing: string[] = [];
  const values = {} as Record<T[number], string>;

  for (const name of names) {
    const value = process.env[name]?.trim();

    if (!value) {
      missing.push(name);
      continue;
    }

    values[name as T[number]] = value;
  }

  if (missing.length > 0) {
    throw new MissingEnvironmentVariablesError(missing);
  }

  return values;
}
