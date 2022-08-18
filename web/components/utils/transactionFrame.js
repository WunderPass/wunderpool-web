import { useEffect, useState } from 'react';

export default function TransactionFrame({ open }) {
  const [isSafari, setIsSafari] = useState(false);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    setIsSafari(
      window.navigator.userAgent.toLowerCase().match(/safari/) &&
        window.navigator.vendor.toLowerCase().match(/apple/)
    );
    setIsApple(window.navigator.vendor.toLowerCase().match(/apple/));
  }, []);

  return (
    <iframe
      className="w-full flex-grow"
      id="fr"
      name="transactionFrame"
      height={!isSafari && open ? '500' : '0'}
      style={{ transition: 'height 300ms ease' }}
    ></iframe>
  );
}
