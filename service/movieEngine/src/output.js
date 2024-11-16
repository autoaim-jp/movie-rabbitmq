const mod = {}

export const init = ({ fs }) => {
  mod.fs = fs
}

export const saveFile = ({ filePath, fileBuffer }) => {
  return mod.fs.writeFileSync(filePath, Buffer.from(fileBuffer))
}

export default {}

