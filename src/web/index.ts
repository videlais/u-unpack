import { unpackUnityPackageWeb, UnpackResult } from './unpacker-web';

// Export for use in browser (webpack will expose this as UUnpack.unpackUnityPackageWeb)
export { unpackUnityPackageWeb };

// Also export as 'unpack' for convenience
export const unpack = unpackUnityPackageWeb;

// Example usage function
export async function handleFileUpload(file: File): Promise<UnpackResult> {
  const arrayBuffer = await file.arrayBuffer();
  return await unpackUnityPackageWeb(arrayBuffer);
}
