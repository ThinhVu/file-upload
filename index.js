const S3StorageService = require('./storage/S3StorageService');
const GridFsStorageService = require('./storage/GridFsStorageService');
const contentApi = require('./contentApi');
const express = require('express');
const app = express.app();

// use S3 storage service
contentApi.useStorageService(new S3StorageService({
  credentialConfig: {
    // ...
  },
  storageConfig: {
    bucket: 'storage', /*name of bucket in s3*/
    uploadFolder: 'media',
    pullZone: '',
  }
}));

// or use GridFs
contentApi.useStorageService(new GridFsStorageService({
  bucket: 'storage', /*prefix name of files, chunk collection in mongodb: {bucket}.files, {bucket}.chunks*/
  db: null, /*mongodb database object*/
  router: app, /*grid fs use app to create endpoint for upload, download file*/
  route: '/file', /*customize route to upload, serve file*/
}));

app.use('/content', contentApi);
// app.use('another route', ..)
// app.listen(8888, ....)
