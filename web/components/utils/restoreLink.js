import Link from 'next/link';

export default function RestoreLink(props) {
  const { isMobile, t } = props;

  return (
    <Link href="/auth/restore" passHref>
      <button className="link underline text-casama-blue pt-4">
        {isMobile
          ? 'Restore from Seed Phrase'
          : 'Restore Wallet from Seed Phrase'}
      </button>
    </Link>
  );
}
