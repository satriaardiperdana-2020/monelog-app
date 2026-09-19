import { afterEach, describe, expect, it, vi } from 'vitest'

import { saveExportFile } from '../../src/services/export/export-file'

afterEach(() => vi.unstubAllGlobals())

describe('export file adapter', () => {
  it('keeps browser exports as normal downloads', async () => {
    const click = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() })
    vi.spyOn(document, 'createElement').mockReturnValue({ click })

    await saveExportFile(
      { data: new Uint8Array([1]), filename: 'laporan.xlsx', mimeType: 'application/test' },
      { isNative: () => false },
    )

    expect(click).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })

  it('writes a scoped native cache file and opens the system share sheet', async () => {
    const writeFile = vi.fn().mockResolvedValue({ uri: 'content://monelog/exports/laporan.pdf' })
    const share = vi.fn()

    await saveExportFile(
      { data: new Uint8Array([1, 2, 3]), filename: 'laporan.pdf', mimeType: 'application/pdf' },
      {
        isNative: () => true,
        loadFilesystem: async () => ({ Directory: { Cache: 'CACHE' }, Filesystem: { writeFile } }),
        loadShare: async () => ({ Share: { share } }),
      },
    )

    expect(writeFile).toHaveBeenCalledWith(expect.objectContaining({
      directory: 'CACHE',
      path: 'exports/laporan.pdf',
      recursive: true,
    }))
    expect(share).toHaveBeenCalledWith(expect.objectContaining({
      files: ['content://monelog/exports/laporan.pdf'],
      title: 'laporan.pdf',
    }))
  })
})
