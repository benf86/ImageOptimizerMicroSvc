const config = require('./config');

const express = require('express');
const multer  = require('multer');
const bodyParser = require('body-parser');
const request = require('request-promise');

const token = process.env.IMGOPTIMIZERTOKEN || config.token;
const port = process.env.IMGOPTIMIZERPORT || config.port;

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

function getImage(req) {
  if (req.query.image) {
    originalName = req.query.image.split('/');
    req.file = {
      mimetype: `image/${originalName[originalName.length - 1].slice(originalName[originalName.length - 1].length - 3)}`,
      originalname: originalName[originalName.length - 1]
    };
  }

  if (req.file && !~['image/png', 'image/jpg'].indexOf(req.file.mimetype)) {
    return Promise.reject('wrong filetype');
  }

  return !req.query.image
    ? Promise.resolve(req.file.buffer)
    : request.get(req.query.image, {
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

app.use((req, res, next) => req.query.token === token
  ? next()
  : res.sendStatus(403)
);

app.use('/optimize',
  bodyParser.urlencoded({ extended: false }),
  upload.single('image'),
  (req, res) => req.file || req.query.image
    ? getImage(req)
      .then(processImage)
      .then(buffer => {
        res.format({ [req.file.mimetype]: () => res.send(buffer) });
      })
      .catch(e => res.status(403) && res.send())
    : res.sendStatus(403)
);

app.listen(port, () => console.log(`listening on ${port}`));