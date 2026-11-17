import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const INSTALLATION_ID_KEY = 'sdm.installation-id.v1';

/** A random app-installation identifier; never treat this as authentication. */
export async function getInstallationId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
  if (existing) return existing;
  const identifier = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, identifier);
  return identifier;
}

export async function clearInstallationId(): Promise<void> {
  await SecureStore.deleteItemAsync(INSTALLATION_ID_KEY);
}
