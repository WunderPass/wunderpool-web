import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

export default function QrCode(props) {
  const [dataUrl, setDataUrl] = useState('');
  const { text, dark, theme, size } = props;

  useEffect(() => {
    if (!text) return;
    const opts = {
      errorCorrectionLevel: 'M',
      type: 'image/webp',
      margin: 0,
      scale: size || 3,
      color: {
        light: '#FFF0',
      },
    };

    QRCode.toDataURL(text, opts)
      .then((imgUrl) => {
        setDataUrl(imgUrl);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [size, text]);

  return <img src={dataUrl} alt={text} />;
}
