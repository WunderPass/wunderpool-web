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
};

module.exports = nextConfig;
