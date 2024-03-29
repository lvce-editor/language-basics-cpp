import { packageExtension } from '@lvce-editor/package-extension'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { copyFiles } from '@lvce-editor/package-extension'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

await copyFiles({
  root,
  files: ['README.md', 'extension.json', 'languageConfiguration.json', 'src'],
})

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
