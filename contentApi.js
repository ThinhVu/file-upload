const express = require('express');
const route = express.Router();

let _storage = null;
route.useStorageService = function(storage) { _storage = storage };

async function getUniqueNewFileName(currentFolderPath, currentFileName) {
  // Generate virtual file name
}

route.post('/', async (req, res) => {
  const {
    folderPath, /*virtual folder path*/
    name, /*original file name*/
    size, /*file size*/
    type, /*file mime type*/
    src,  /* actual path which file stored: BunnyCDN pullzone if S3, or path to GridFs */
    parts /*md5 for each chunks*/
  } = req.body;

  const fileName = path.parse(src).base
  const virtualFileName = await getUniqueNewFileName(folderPath, name);
  const newContentRecord = {
    name: virtualFileName,
    path: `${folderPath}/${virtualFileName}`,
    type: type,
    src: src,
    parts: parts,
    size: size,
    etag: _storage.getEtag(fileName) /*md5 info retrieved from storage service*/,
    dateCreated: new Date(),
  };
  // do stuff here with src: get thumbnail, video, image resolution, etc
  const data = await cms.getModel('Content').create(newContentRecord);
  res.status(200).json({ok: true, data })
});

route.delete('/:fileId', async (req, res) => {
  if (!req.params.ids || !req.session.userId) {
    res.status(400).end();
    return
  }
  const contentModel = cms.getModel('Content');
  const content = await contentModel.find({_id: req.params.fileId });
  const fileName = path.parse(content.src).base
  await _storage.delete(fileName);
  await contentModel.remove({ _id: fileId });
});

route.get('/upload-form/:fileName', async (req, res) => {
  const { fileName } = req.params;
  if (!fileName) {
    res.json({success: false, message: 'Missing file name'});
  } else {
    const result = await _storage.getUploadForm(fileName)
    res.json(result)
  }
});

module.export = route;
