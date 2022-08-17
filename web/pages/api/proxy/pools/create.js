import axios from 'axios';
const FormData = require('form-data');
import formidable from 'formidable';
const fs = require('fs');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const data = new FormData();
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  try {
    form.parse(req, (err, fields, files) => {
      data.append('pool', fields['pool'], { contentType: 'application/json' });
      files['pool_image']?.filepath &&
        data.append(
          'pool_image',
          fs.createReadStream(files['pool_image'].filepath),
          {
            filename: files['pool_image'].newFilename,
            contentType: files['pool_image'].mimetype,
          }
        );
      files['pool_banner']?.filepath &&
        data.append(
          'pool_banner',
          fs.createReadStream(files['pool_banner'].filepath),
          {
            filename: files['pool_banner'].newFilename,
            contentType: files['pool_banner'].mimetype,
          }
        );

      axios({
        method: 'post',
        url: `${process.env.POOLS_SERVICE}/v2/web3Proxy/pools`,
        headers: {
          Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
          ...data.getHeaders(),
        },
        data: data,
      })
        .then((response) => {
          const { pool_name, pool_creator, initial_invest } = JSON.parse(
            fields['pool']
          );
          console.log(`[${new Date().toJSON()}] Pool created`, {
            pool_name,
            pool_creator,
            initial_invest,
          });
          res.status(200).json(response.data);
          return;
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json(error);
          return;
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    return;
  }
};
