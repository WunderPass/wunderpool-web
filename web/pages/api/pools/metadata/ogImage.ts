import {
  roundRect,
  getLines,
  imageToSquare,
  roundImage,
} from '../../../../services/nodeCanvas';

const http = require('https');
import { createCanvas, loadImage, Image, registerFont } from 'canvas';

function getImage(address: string): Promise<Image> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'pools-service.wunderpass.org',
      path: `/web3Proxy/pools/${address}/image`,
      headers: {
        Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
      },
    };

    http.get(options, function (resp) {
      if (resp.statusCode == 200 && resp.headers['content-type']) {
        var data = [];
        resp
          .on('data', function (chunk) {
            data.push(chunk);
          })
          .on('end', function () {
            var buffer = Buffer.concat(data);
            const img = new Image();
            img.src = buffer;
            if (img.width > 0) {
              resolve(img);
            } else {
              loadImage('./public/casama_logo.png').then((image) => {
                resolve(image);
              });
            }
          });
      } else {
        loadImage('./public/casama_logo.png').then((image) => {
          resolve(image);
        });
      }
    });
  });
}

export default function handler(req, res) {
  const { name, address, balance, maxMembers, members } = req.query;
  const canvasWidth = 1280;
  const canvasHeight = 720;
  const padding = 60;
  const poolImgWidth = 300;
  const logoHeight = 80;
  try {
    getImage(address).then(async (image) => {
      registerFont('./assets/fonts/Graphik/GraphikLight.otf', {
        family: 'Graphik',
        weight: 'light',
      });
      registerFont('./assets/fonts/Graphik/GraphikBold.otf', {
        family: 'Graphik',
        weight: 'bold',
      });
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const context = canvas.getContext('2d');
      context.fillStyle = '#7560ff';
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.fillStyle = '#00000077';
      roundRect(
        context,
        (padding * 7) / 10,
        (padding * 7) / 10,
        canvasWidth - padding,
        canvasHeight - padding,
        20
      );
      context.fillStyle = '#fff';
      roundRect(
        context,
        padding / 2,
        padding / 2,
        canvasWidth - padding,
        canvasHeight - padding,
        20
      );
      const croppedImage = imageToSquare(image);
      const roundedImage = roundImage(croppedImage);
      context.drawImage(
        roundedImage,
        canvasWidth - poolImgWidth - padding,
        padding,
        poolImgWidth,
        poolImgWidth
      );
      context.font = `bold ${Math.round(0.03 * canvasWidth)}pt Graphik`;
      context.fillStyle = '#000';
      context.textBaseline = 'top';
      const lines = getLines(
        context,
        name,
        canvasWidth - poolImgWidth - padding * 2
      );
      const visibleLines = lines.slice(0, 3);
      visibleLines.forEach((line, i) => {
        // Ziel: 4 Zeilen mit identischem Abstand, Y-Achse aligned mit Pool Image
        // Demnach ist die Höhe jeder Zeile 1/4 der Pool Image Höhe => i * (poolImgWidth / 4).
        // Das Alignment lösen wir, indem wir nun ausrechnen, wie viel Höhe alle Zeilen zusammen einnehmen. Es ergeben sich folgende Szenarien:
        // #Zeilen | Höhe Gesamt | MarginTop
        //       1 |         2/4 |       2/8
        //       2 |         3/4 |       1/8
        //       3 |         4/4 |       0/8
        // So kommen wir für MarginTop auf die Formel: ((3 - visibleLines.length) * poolImgWidth) / 8
        // Ist eigentlich echt logisch, hat mich aber ne ganze fucking Nacht beschäftigt :D
        const yOffset =
          padding +
          ((3 - visibleLines.length) * poolImgWidth) / 8 +
          i * (poolImgWidth / 4);
        context.fillText(
          i == 2 && lines.length > 3 ? `${line}...` : line,
          padding,
          yOffset
        );
      });

      if (balance) {
        context.font = `light ${Math.round(0.03 * canvasWidth)}pt Graphik`;
        context.fillText(
          `${balance}`,
          padding,
          padding + poolImgWidth - poolImgWidth / (visibleLines.length + 1)
        );
      }

      context.font = `light ${Math.round(0.036 * canvasWidth)}pt Graphik`;
      context.textAlign = 'center';

      if (members || maxMembers) {
        context.fillText(
          `${maxMembers - (members || 0)}/${maxMembers} Spots Left - Join Now`,
          canvasWidth / 2,
          (canvasHeight * 5) / 8
        );
      } else {
        context.fillText(
          'Pool capital and execute trades in minutes',
          canvasWidth / 2,
          (canvasHeight * 5) / 8
        );
      }
      loadImage('./public/casama.svg').then((logo) => {
        const logoWidth = (logo.width * logoHeight) / logo.height;
        context.drawImage(
          logo,
          canvasWidth - logoWidth - padding,
          canvasHeight - logoHeight - padding,
          logoWidth,
          logoHeight
        );

        res.status(200).setHeader('content-type', 'image/png');
        res.end(canvas.toBuffer('image/png'));
      });
    });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
}
