const _ = require('lodash')
const uuidv1 = require('uuid')

class S3StorageService extends IStorageService {
  constructor(options) {
    super(options)
    const {credentialConfig, storageConfig} = config;
    AWS.config.update(credentialConfig);
    this.storageConfig = storageConfig;
    this.s3Storage = new AWS.S3({
      useAccelerateEndpoint: false,
      s3ForcePathStyle: true,
      apiVersion: '2006-03-01',
    });
  }

  async getUploadForm(fileName) {
    const uploadFileName = uuidv1() + path.parse(fileName).ext;
    const form = await (new Promise((resolve, reject) => {
      this.s3Storage.createPresignedPost({
        Bucket: this.storageConfig.bucket,
        Expires: this.storageConfig.expires,
        Fields: {
          Key: `${this.storageConfig.uploadFolder}/${uploadFileName}`
        }
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }));

    return {
      src: `${this.storageConfig.pullZone}${uploadFileName}`,
      form
    }
  }

  async getEtag(fileName) {
    const uploadObject = `${this.storageConfig.uploadFolder}/${fileName}`
    const results = await (new Promise((resolve, reject) => {
      this.s3Storage.listObjectsV2({
        Bucket: this.storageConfig.bucket,
        Prefix: uploadObject
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    }));

    return _.replace(results.Contents[0].ETag, /\"/g, '')
  }

  async deleteFile(fileName) {
    return new Promise((resolve, reject) => {
      this.s3Storage.deleteObjects({
        Bucket: this.storageConfig.bucket,
        Delete: { Objects: [ { Key: `${this.storageConfig.uploadFolder}/${fileName}` }] },
      }, async (err, data) => {
        if (err) reject(err)
        else resolve(data)
      });
    })
  }
}
