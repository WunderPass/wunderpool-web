const axios = require('axios');
const FormData = require('form-data');
import formidable from 'formidable';
const fs = require('fs');

export const config = {
  api: {
    bodyParser: false,
  },
};
const ERRORS = [
  {
    name: 'FileSizeLimitExceededException',
    message: 'Maximum Upload Size Exceeded',
  },
];

export default async (req, res) => {
  const data = new FormData();
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (files['pool_image'].filepath) {
      data.append(
        'pool_image',
        fs.createReadStream(files['pool_image'].filepath)
      );
      axios({
        method: 'post',
        url: `${process.env.POOLS_SERVICE}/web3Proxy/pools/${fields.poolAddress}/image`,
        headers: {
          Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
          ...data.getHeaders(),
        },
        data: data,
      })
        .then((response) => {
          res.status(200).json(response.data);
        })
        .catch((err) => {
          let errorMessage = null;
          let rawMessage = err?.response?.data?.error || '';

          ERRORS.forEach((errorObj) => {
            if (rawMessage.match(errorObj.name)) {
              errorMessage = errorObj.message;
            }
          });
          console.log(
            'AXIOS ERROR',
            err?.response?.data || err?.response || err
          );
          res
            .status(err?.response?.data?.status || 500)
            .json({ error: errorMessage || 'Request Invalid' });
          return;
        });
    } else {
      res.status(401).json({ error: 'Please Select an Image' });
    }
  });
};
