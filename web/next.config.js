/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        ([key]) =>
          ![
            'NODE_VERSION',
            'NODE_ENV',
            '__NEXT_PROCESSED_ENV',
            'NODE_EXE',
          ].includes(key)
      )
    ),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
