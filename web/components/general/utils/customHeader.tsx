import Head from 'next/head';

type CustomHeaderProps = {
  title?: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
};

export default function CustomHeader({
  title = 'Casama',
  description = 'Pool capital with your friends, vote on crypto plays and make bank together!',
  imageUrl,
  favicon = '/favicon.ico',
}: CustomHeaderProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="shortcut icon" href={favicon} />
      <link rel="icon" href={favicon} />

      <meta
        name="twitter:image"
        content={`https://app.casama.io${
          encodeURI(imageUrl) || 'images/touch/homescreen192.png'
        }`}
      />
      <meta name="twitter:creator" content="@casama_io" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://app.casama.io" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <meta property="og:type" content="website" />
      <meta
        property="og:image"
        content={`https://app.casama.io${
          encodeURI(imageUrl) || 'images/touch/homescreen512.png'
        }`}
      />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={title} />
      <meta property="og:url" content="https://app.casama.io" />
    </Head>
  );
}
