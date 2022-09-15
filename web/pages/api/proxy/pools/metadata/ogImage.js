// import sharp from 'sharp';
// const http = require('https');

// const OPTIONS = {
//   width: 1200,
//   height: 630,
//   imageWidth: 400,
//   imageHeight: 400,
//   imageX: 400,
//   imageY: 20,
//   borderRadius: 20,
//   bgColor: { r: 70, g: 42, b: 241 },
// };

// // Length | font-size | Viewbox
// // 10 ch  | 1em       | 0 0 12 12
// // 20 ch  | 1em       | 0 0 24 24
// // 30 ch  | 1em       | 0 0 36 36

// function getImage(address) {
//   return new Promise((resolve) => {
//     const options = {
//       hostname: 'pools-service.wunderpass.org',
//       path: `/web3Proxy/pools/${address}/image`,
//       headers: {
//         Authorization: `Bearer ${process.env.POOL_SERVICE_TOKEN}`,
//       },
//     };

//     http.get(options, function (resp) {
//       if (resp.statusCode == 200 && resp.headers['content-type']) {
//         var data = [];
//         resp
//           .on('data', function (chunk) {
//             data.push(chunk);
//           })
//           .on('end', function () {
//             var buffer = Buffer.concat(data);
//             resolve(buffer);
//           });
//       } else {
//         sharp('./public/casama_logo.png')
//           .resize(OPTIONS.imageWidth)
//           .modulate({
//             brightness: 5,
//           })
//           .toBuffer()
//           .then(resolve);
//       }
//     });
//   });
// }

// export default function handler(req, res) {
//   getImage(req.query.address).then(async (buff) => {
//     try {
//       const rect = Buffer.from(
//         `<svg><rect x="0" y="0" width="${OPTIONS.imageWidth}" height="${OPTIONS.imageHeight}" rx="${OPTIONS.borderRadius}" ry="${OPTIONS.borderRadius}"/></svg>`
//       );
//       const svgHeight =
//         OPTIONS.height - OPTIONS.imageHeight - OPTIONS.imageY * 2;
//       const sanitizedName = req.query.name.replaceAll(/\p{Emoji}/gu, ' ');
//       const viewBox = Math.ceil(sanitizedName.length / 10) * 12;
//       const textY =
//         100 - Math.min(Math.ceil(sanitizedName.length / 10) * 20, 50);
//       const poolName = Buffer.from(
//         `<svg viewBox="0 0 ${viewBox} ${viewBox}" width="${OPTIONS.width}" height="${svgHeight}">
//         <text x="50%" y="${textY}%" style="text-anchor: middle; font: 1em bold sans-serif; fill: white;">${sanitizedName}</text>
//         </svg>`
//       );

//       const profile = await sharp(buff)
//         .resize({
//           width: OPTIONS.imageWidth,
//           height: OPTIONS.imageHeight,
//           fit: sharp.fit.cover,
//         })
//         .png()
//         .composite([{ input: rect, blend: 'dest-in' }])
//         .toBuffer();

//       await sharp({
//         create: {
//           width: OPTIONS.width,
//           height: OPTIONS.height,
//           channels: 3,
//           background: OPTIONS.bgColor,
//         },
//       })
//         .composite([
//           {
//             input: profile,
//             left: OPTIONS.imageX,
//             top: OPTIONS.imageY,
//           },
//           {
//             input: poolName,
//             left: 0,
//             top: OPTIONS.imageY * 2 + OPTIONS.imageHeight,
//           },
//         ])
//         .webp()
//         .pipe(res);
//     } catch (error) {
//       console.log(error);
//       res.json({ error: error });
//     }
//   });
// }
