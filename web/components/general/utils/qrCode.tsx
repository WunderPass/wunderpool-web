import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

type QrCodeProps = { text: string; size?: number };

export default function QrCode(props: QrCodeProps) {
  const { text, size } = props;
  const [dataUrl, setDataUrl] = useState('');

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
