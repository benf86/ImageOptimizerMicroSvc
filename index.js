const config = require('./config');

const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const request = require('request-promise');

const token = process.env.IMGOPTIMIZERTOKEN || config.token;

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const Duplex = require('stream').Duplex;

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

function bufferToStream(buffer) {
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function getImage(req) {
  if (req.body.image) {
    originalName = req.body.image.split('/');
    req.file = {
      mimetype: `image/${originalName[originalName.length - 1].slice(originalName[originalName.length - 1].length - 3)}`,
      originalname: originalName[originalName.length - 1]
    };
  }

  if (req.file && !~['image/png', 'image/jpg'].indexOf(req.file.mimetype)) {
    return Promise.reject('wrong filetype');
  }

  return !req.body.image
    ? req.file.buffer
    : request.get(req.body.image, {
      encoding: null
    });
}

function processImage(buffer) {
  return imagemin.buffer(buffer, {
    plugins: [
      imageminJpegtran(),
      imageminPngquant({quality: '65-80'})
    ]
  });
}

app.use((req, res, next) => req.headers.authorization === `Bearer ${token}`
  ? next()
  : res.status(403) && res.send()
);

app.use('/optimize',
  bodyParser.urlencoded({ extended: false }),
  upload.single('image'),
  (req, res) => req.file || req.body.image
    ? getImage(req)
      .then(processImage)
      .then(buffer => {
        bufferToStream(buffer)
        .pipe(require('fs').createWriteStream(`/home/benf/coding/xteam/hackathon/imgoptimizer/minified_${req.file.originalname}`));
        res.send();
      })
      .catch(e => res.status(403) && res.send())
    : res.status(403) && res.send()
);

app.listen(process.env.PORT || 3000);