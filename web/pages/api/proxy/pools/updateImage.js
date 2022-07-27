const axios = require('axios');
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

    form.parse(req, (err, fields, files) => {
        data.append('pool_image', fs.createReadStream(files['pool_image'].filepath));
        axios({
            method: "post",
            url: `https://pools-service.wunderpass.org/web3Proxy/pools/${fields.poolAddress}/image`,
            headers: {
                authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
            },
            data: data,
        })
            .then((response) => {
                res.status(200).json(response.data);
            })
            .catch((error) => {
                res.status(500).json('Error');
            });
    });
}