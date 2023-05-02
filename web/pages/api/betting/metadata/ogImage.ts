import fs from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import {
  getLines,
  imageToSquare,
  roundRect,
} from '../../../../services/nodeCanvas';

async function getImage(id: string) {
  const imgPath = `./assets/teamImages/${id}.png`;

  if (fs.existsSync(imgPath)) {
    return await loadImage(imgPath);
  } else {
    return await loadImage('./assets/teamImages/fallback.png');
  }
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
    roundRect(
      context,
      (padding * 7) / 10,
      (padding * 7) / 10,
      canvasWidth - padding,
      canvasHeight - padding,
      20
    );
    context.fillStyle = '#F7F7F7';
    roundRect(
      context,
      padding / 2,
      padding / 2,
      canvasWidth - padding,
      canvasHeight - padding,
      20
    );

    const teamHomeImage = imageToSquare(await getImage(teamHomeId));
    const teamAwayImage = imageToSquare(await getImage(teamAwayId));

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
