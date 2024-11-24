const mod = {}

export const init = ({ fs }) => {
  mod.fs = fs
}

export const getFileDirList = ({ dirPath }) => {
  let fileDirEntryList = []
  try {
    fileDirEntryList = mod.fs.readdirSync(dirPath, { withFileTypes: true })
  } catch(e){
    return []
  }

  const fileDirList = fileDirEntryList.map((entry) => {
    if(entry.isDirectory()) {
      return `${entry.name}/`
    } else {
      return entry.name
    }
  })

  return fileDirList
}

export const getFileContent = ({ filePath }) => {
  if (filePath.includes('..')) {
    return Buffer.from('fail')
  }
  return mod.fs.readFileSync(filePath)
}

export default {}

