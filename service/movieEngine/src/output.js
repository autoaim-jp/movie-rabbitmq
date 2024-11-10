const mod = {}

export const init = ({ fs }) => {
  mod.fs = fs
}

export const saveFile = ({ filePath, buf }) => {
  return mod.fs.writeFileSync(filePath, buf)
}

export default {}

