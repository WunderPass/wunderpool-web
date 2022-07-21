import useWunderPass from '/hooks/useWunderPass';

export default function TransactionFrame({ open }) {
  const { isSafari } = useWunderPass({});

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
