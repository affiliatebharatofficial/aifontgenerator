declare module 'wawoff2' {
  export function compress(input: Uint8Array | Buffer): Promise<Uint8Array>;
  const wawoff2: {
    compress: (input: Uint8Array | Buffer) => Promise<Uint8Array>;
  };
  export default wawoff2;
}
