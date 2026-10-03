const CREDENTIALS_VERSION = 1;

export type StoredCredentials = {
  v: number;
  payload: string;
};

export function wrapEncryptedCredentials(
  encrypted: string
): StoredCredentials {
  return {
    v: CREDENTIALS_VERSION,
    payload: encrypted,
  };
}

export function unwrapEncryptedCredentials(
  credentials: unknown
): string | null {
  if (typeof credentials === "string") {
    return credentials;
  }

  if (
    credentials &&
    typeof credentials === "object" &&
    "payload" in credentials &&
    typeof (credentials as StoredCredentials).payload ===
      "string"
  ) {
    return (credentials as StoredCredentials).payload;
  }

  return null;
}

export function hasStoredCredentials(
  credentials: unknown
): boolean {
  return Boolean(
    unwrapEncryptedCredentials(credentials)
  );
}
