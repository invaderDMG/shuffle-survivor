// Generates a 128-char verifier and its SHA-256 challenge
export const generateCodeVerifier = () =>
  [...crypto.getRandomValues(new Uint8Array(96))]
    .map(x => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'[x % 66])
    .join('');

export const sha256 = async (plain: string) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
