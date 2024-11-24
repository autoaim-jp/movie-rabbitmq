const getHandlerUploadFile = ({
  handleUploadFile, createResponse, multer, FormData, Readable,
}) => {
  return async (req, res) => {
    const { accessToken } = req.session.auth

    const handleResult = await handleUploadFile({
      req, accessToken, multer, FormData, Readable,                                                      
    })  

    createResponse({ req, res, handleResult })
  }
}

// ファイルアップロード処理 req.file.bufferを作成
// ファイルアップロードでエラーなら終了
const getHandlerFileUpload = ({ FORM_UPLOAD, parseMultipartFileUpload }) => {
  return async (req, res, next) => {
    const uploadResult = await parseMultipartFileUpload({ req, formKey: FORM_UPLOAD })
    console.log({ uploadResult })
    if (!uploadResult) {
      res.json({ result: uploadResult })
      return
    }

    next()
  }
}

// 複数ファイルアップロード
const getHandlerFileListUpload = ({ FILE_LIST_UPLOAD, parseMultipartFileListUpload }) => {
  return async (req, res, next) => {
    const uploadResult = await parseMultipartFileListUpload({ req, formKey: FILE_LIST_UPLOAD })
    console.log({ uploadResult })
    if (!uploadResult) {
      res.json({ result: uploadResult })
      return
    }

    next()
  }
}

const getHandlerRegisterPingPrompt = ({ handleRegisterPingPrompt }) => {
  return async (req, res) => {
    const { rightTopText, leftTopText, rightBottomText } = req.body
    // console.log({ debug: true, request: 'ok!', prompt })
    const fileBuffer = req.file.buffer

    const handleResult = await handleRegisterPingPrompt({ 
      rightTopText, leftTopText, rightBottomText,
      fileBuffer, 
    })

    res.json({ result: handleResult })
  }
}

const getHandlerRegisterDummyPrompt = ({ handleRegisterDummyPrompt }) => {
  return async (req, res) => {
    // console.log({ debug: true, request: 'ok!', prompt })
    const handleResult = await handleRegisterDummyPrompt({})

    res.json({ result: handleResult })
  }
}

const getHandlerRegisterMainPrompt = ({ handleRegisterMainPrompt }) => {
  return async (req, res) => {
    // console.log({ debug: true, request: 'ok!', prompt })
    const fileList = req.files
    const { title, narrationCsv } = req.body
    const handleResult = await handleRegisterMainPrompt({ fileList, title, narrationCsv })

    res.json({ result: handleResult })
  }
}

const getHandlerLookupResponse = ({ handleLookupResponse }) => {
  return async (req, res) => {
    const { requestId } = req.query

    const handleResult = handleLookupResponse({ requestId })

    res.json({ result: handleResult })
  }
}

const getHandlerFileList = ({ handleFileList }) => {
  return async (req, res) => {
    const { requestId } = req.query
    const handleResult = handleFileList({ requestId  })

    res.json({ result: handleResult })
  }
}

const getHandlerFileContent = ({ handleFileContent }) => {
  return async (req, res) => {
    const { requestId, fileName } = req.query

    const handleResultBuffer = handleFileContent({ requestId, fileName })

    // res.json({ result: handleResult })
    res.end(handleResultBuffer)
  }
}

export default {
  getHandlerFileUpload,
  getHandlerFileListUpload,
  getHandlerRegisterPingPrompt,
  getHandlerRegisterDummyPrompt,
  getHandlerRegisterMainPrompt,
  getHandlerLookupResponse,
  getHandlerFileList,
  getHandlerFileContent,
}


