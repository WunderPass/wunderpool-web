import { useEffect, useState } from 'react';

export default function TransactionFrame({ open }) {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(
      window.navigator.userAgent.toLowerCase().match(/safari/) &&
        window.navigator.vendor.toLowerCase().match(/apple/)
    );
  }, []);

  return (
    <iframe
      className="w-auto"
      id="fr"
      name="transactionFrame"
      height={!isSafari && open ? '500' : '0'}
      style={{ transition: 'height 300ms ease' }}
    ></iframe>
  );
}
