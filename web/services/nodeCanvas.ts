import { Canvas, Image, createCanvas } from 'canvas';

export function imageToSquare(image: Image) {
  const maxWidthHeight = Math.max(image.naturalWidth, image.naturalHeight);
  const canvas = createCanvas(maxWidthHeight, maxWidthHeight);
  const context = canvas.getContext('2d');
  context.drawImage(
    image,
    (image.naturalWidth - maxWidthHeight) / 2,
    (image.naturalHeight - maxWidthHeight) / 2,
    maxWidthHeight,
    maxWidthHeight,
    0,
    0,
    maxWidthHeight,
    maxWidthHeight
  );
  return canvas;
}

export function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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

export function seperateWord(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
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

export function getLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
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

export function roundImage(image: Image | Canvas) {
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
