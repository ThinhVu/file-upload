class IStorageService {
  constructor(options) {}

  getUploadForm() {
    throw 'Not implemented'
  }

  getEtag(fileName) {
    throw 'Not implemented'
  }

  deleteFile(fileName) {
    throw 'Not implemented'
  }

  downloadFile(fileName) {
    throw 'Not implemented'
  }
}
