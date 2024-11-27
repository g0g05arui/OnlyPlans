const {Storage} = require('@google-cloud/storage');

const storage = new Storage({keyFilename: 'key.json'});

const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = bucket;