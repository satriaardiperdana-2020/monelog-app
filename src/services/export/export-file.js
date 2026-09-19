import { Capacitor } from '@capacitor/core'

function base64FromArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function downloadInBrowser({ data, filename, mimeType }) {
  const url = URL.createObjectURL(new Blob([data], { type: mimeType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Saves an export using a normal browser download, or a scoped app-cache file
 * followed by the Android/iOS system share sheet when running in Capacitor.
 */
export async function saveExportFile(
  { data, filename, mimeType },
  {
    isNative = Capacitor.isNativePlatform,
    loadFilesystem = () => import('@capacitor/filesystem'),
    loadShare = () => import('@capacitor/share'),
  } = {},
) {
  if (!isNative()) {
    downloadInBrowser({ data, filename, mimeType })
    return filename
  }

  const [{ Directory, Filesystem }, { Share }] = await Promise.all([loadFilesystem(), loadShare()])
  const bytes = data instanceof ArrayBuffer ? data : await new Blob([data]).arrayBuffer()
  const file = await Filesystem.writeFile({
    data: base64FromArrayBuffer(bytes),
    directory: Directory.Cache,
    path: `exports/${filename}`,
    recursive: true,
  })
  await Share.share({
    dialogTitle: filename,
    files: [file.uri],
    title: filename,
  })
  return filename
}
