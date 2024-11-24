const mod = {}

export const init = ({ fs }) => {
  mod.fs = fs
}

export const saveFile = ({ filePath, fileBuffer }) => {
  return mod.fs.writeFileSync(filePath, Buffer.from(fileBuffer))
}

export const makeDir = ({ dirPath }) => {
  return mod.fs.mkdirSync(dirPath, { recursive: true })
}

export default {}

