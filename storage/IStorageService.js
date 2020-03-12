class IStorageService {
  constructor(options) {}

  async getUploadForm() {
    throw 'Not implemented'
  }

  async getEtag(fileName) {
    throw 'Not implemented'
  }

  async deleteFile(fileName) {
    throw 'Not implemented'
  }
}
