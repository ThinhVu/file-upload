const _ = require('lodash');
const uuidv1 = require('uuid');
const path = require('path');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');

class GridFsStorageService extends IStorageService {
  constructor(options) {
    super(options);

    this.fileCollectionName = `${options.bucket}.files`;
    this.db = options.db;
    this.bucket = new GridFSBucket(this.db, {
      bucketName: options.bucket,
      chunkSizeBytes: 1024 * 64 /*64 kb*/
    });

    if (!options.route) {
      throw 'express route should be provided as route property of option object'
    }

    const router = options.router;
    this.fileRoute = options.route || '/_________file';
    router.post(`${this.fileRoute}/:fileName`, multer({
      storage: {
        _handleFile: (req, file, cb) => {
          const uploadStream = this.bucket.openUploadStream(req.params.fileName)
          uploadStream.once('error', () => cb(null, false));
          uploadStream.once('finish', () => cb(null, true), (req, res, next) => res.send(200).end());
          file.stream.pipe(uploadStream)
        },
        _removeFile: () => {
        }
      }
    }).any());
    router.get(`${this.fileRoute}/:fileName`, async (req, res) => {
      await this.bucket.openDownloadStreamByName(req.params.fileName).on('error', next).pipe(res)
    })
  }

  async getUploadForm(fileName) {
    const uploadFileName = uuidv1() + path.parse(fileName).ext;
    return { src: `${this.fileRoute}/${uploadFileName}`, form: { /* add extra hidden field to extend upload function, restriction, timeout etc */ } }
  }

  async getEtag(fileName) {
    const fileInfo = await this.db.collection(this.fileCollectionName).findOne({ filename: fileName })
    return fileInfo.md5
  }

  async deleteFile(fileName) {
    const fileInfo = await this.db.collection(this.fileCollectionName).findOne({ filename: fileName });
    this.bucket.delete(fileInfo._id);
  }
}
