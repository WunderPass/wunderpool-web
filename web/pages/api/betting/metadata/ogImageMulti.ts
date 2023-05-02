import fs from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import {
  getLines,
  imageToSquare,
  roundRect,
} from '../../../../services/nodeCanvas';
import { NextApiRequest, NextApiResponse } from 'next';

async function getImage(id: string) {
  const imgPath = `./assets/teamImages/${id}.png`;

  if (fs.existsSync(imgPath)) {
    return await loadImage(imgPath);
  } else {
    return await loadImage('./assets/teamImages/fallback.png');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { teamIds: teamIdsString, eventName } = req.query;

  const canvasWidth = 1280;
  const canvasHeight = 720;
  const padding = 60;
  const teamImgWidth = 200;
  const teamImgSpacing = -80;
  const logoHeight = 80;

  const teamImageArea = canvasWidth - padding * 2;
  const teamImgCount = Math.floor(
    teamImageArea / (teamImgWidth + teamImgSpacing)
  );

  const teamsIds = (
    Array.isArray(teamIdsString) ? teamIdsString : teamIdsString.split(',')
  ).slice(0, teamImgCount);
  const teamImages = await Promise.all(teamsIds.map((id) => getImage(id)));

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

    for (let i = 0; i < teamImages.length; i++) {
      const teamImage = imageToSquare(teamImages[i]);
      const teamX = padding + (teamImgWidth + teamImgSpacing) * i;
      context.drawImage(
        teamImage,
        teamX,
        padding * 1.5,
        teamImgWidth,
        teamImgWidth
      );
    }

    context.textAlign = 'center';
    context.fillStyle = '#000';
    context.textBaseline = 'top';
    context.font = `light ${Math.round(0.03 * canvasWidth)}pt Graphik`;

    const lines = getLines(
      context,
      eventName as string,
      canvasWidth - padding * 2
    );
    const visibleLines = lines.slice(0, 2);
    visibleLines.forEach((line, i) => {
      const yOffset = padding * 3 + teamImgWidth + i * padding;
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
