const http = require('https');
const { createCanvas, loadImage, Image, registerFont } = require('canvas');

function square(image) {
  const minWidthHeight = Math.min(image.naturalWidth, image.naturalHeight);
  const canvas = createCanvas(minWidthHeight, minWidthHeight);
  const context = canvas.getContext('2d');
  context.drawImage(
    image,
    (image.naturalWidth - minWidthHeight) / 2,
    (image.naturalHeight - minWidthHeight) / 2,
    minWidthHeight,
    minWidthHeight,
    0,
    0,
    minWidthHeight,
    minWidthHeight
  );
  return canvas;
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fill();
}

function round(image) {
  const { width, height } = image;
  const radius = width * 0.1;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.save();
  context.beginPath();
  context.moveTo(radius, 0);
  context.lineTo(width - radius, 0);
  context.quadraticCurveTo(width, 0, width, radius);
  context.lineTo(width, height - radius);
  context.quadraticCurveTo(width, height, width - radius, height);
  context.lineTo(radius, height);
  context.quadraticCurveTo(0, height, 0, height - radius);
  context.lineTo(0, radius);
  context.quadraticCurveTo(0, 0, radius, 0);
  context.closePath();
  context.clip();
  context.drawImage(image, 0, 0, width, height);
  context.restore();
  return canvas;
}

function seperateWord(context, text, maxWidth) {
  const textWidth = context.measureText(text).width;
  if (textWidth <= maxWidth) return [text];
  let letters = text.split('');
  let lines = [];
  let currentLine = letters[0];

  for (let i = 1; i < letters.length; i++) {
    let letter = letters[i];
    let width = context.measureText(`${currentLine}${letter}-`).width;
    if (width < maxWidth) {
      currentLine += letter;
    } else {
      lines.push(`${currentLine}-`);
      currentLine = letter;
    }
  }
  lines.push(currentLine);
  return lines;
}

function getLines(context, text, maxWidth) {
  const textWidth = context.measureText(text).width;
  if (textWidth <= maxWidth) return [text];
  let words = text.split(' ');
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if (
      context.measureText(currentLine).width > maxWidth &&
      currentLine.split(' ').length == 1
    ) {
      const seperatedWord = seperateWord(context, currentLine, maxWidth);
      lines.push(...seperatedWord.slice(0, -1));
      currentLine = seperatedWord.slice(-1)[0];
    }
    let word = words[i];
    let width = context.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (context.measureText(currentLine).width > maxWidth) {
    const seperatedWord = seperateWord(context, currentLine, maxWidth);
    lines.push(...seperatedWord.slice(0, -1));
    currentLine = seperatedWord.slice(-1)[0];
  }
  lines.push(currentLine);
  return lines;
}

function getImage(address) {
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
            resolve(img);
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
      context.fillStyle = '#00000077';
      roundRect(
        context,
        canvasWidth - poolImgWidth - padding + 5,
        padding + 5,
        poolImgWidth,
        poolImgWidth,
        poolImgWidth * 0.1
      );
      context.fillStyle = '#fff';
      const croppedImage = square(image);
      const roundedImage = round(croppedImage);
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
          `$${balance}`,
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
