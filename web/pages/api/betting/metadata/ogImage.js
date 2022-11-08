const { createCanvas, loadImage, Image, registerFont } = require('canvas');
const fs = require('fs');

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

function getImage(id) {
  return new Promise((resolve) => {
    const imgPath = `./assets/teamImages/${id}.png`;

    if (fs.existsSync(imgPath)) {
      loadImage(imgPath).then((image) => {
        resolve(image);
      });
    } else {
      loadImage('./assets/teamImages/fallback.png').then((image) => {
        resolve(image);
      });
    }
  });
}

export default async function handler(req, res) {
  const { teamHomeId, teamAwayId, eventName } = req.query;
  const canvasWidth = 1280;
  const canvasHeight = 720;
  const padding = 60;
  const teamImgWidth = 300;
  const logoHeight = 80;

  try {
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

    const teamHomeImage = square(await getImage(teamHomeId));
    const teamAwayImage = square(await getImage(teamAwayId));

    context.drawImage(
      teamHomeImage,
      padding * 3,
      padding,
      teamImgWidth,
      teamImgWidth
    );
    context.drawImage(
      teamAwayImage,
      canvasWidth - teamImgWidth - padding * 3,
      padding,
      teamImgWidth,
      teamImgWidth
    );
    context.font = `bold ${Math.round(0.07 * canvasWidth)}pt Graphik`;
    context.fillStyle = '#7560ff';
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText('vs', canvasWidth / 2, padding + teamImgWidth / 2);

    context.fillStyle = '#000';
    context.textBaseline = 'top';
    context.font = `light ${Math.round(0.03 * canvasWidth)}pt Graphik`;

    const lines = getLines(context, eventName, canvasWidth - padding * 2);
    const visibleLines = lines.slice(0, 2);
    visibleLines.forEach((line, i) => {
      const yOffset = padding * 2 + teamImgWidth + i * padding;
      context.fillText(
        i == 1 && lines.length > 2 ? `${line}...` : line,
        canvasWidth / 2,
        yOffset
      );
    });

    const casamaLogo = await loadImage('./public/casama.svg');
    const logoWidth = (casamaLogo.width * logoHeight) / casamaLogo.height;
    context.drawImage(
      casamaLogo,
      canvasWidth - logoWidth - padding,
      canvasHeight - logoHeight - padding,
      logoWidth,
      logoHeight
    );

    res.status(200).setHeader('content-type', 'image/png');
    res.end(canvas.toBuffer('image/png'));
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
}
