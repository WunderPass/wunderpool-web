import { useRouter } from 'next/router';

export default function UseAdvancedRouter() {
  const router = useRouter();

  function addQueryParam(object) {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, ...object },
      },
      undefined,
      { shallow: true }
    );
  }

  function removeQueryParam(key) {
    const query = {
      ...Object.fromEntries(
        Object.entries(router.query).filter(([k]) => k != key)
      ),
    };
    router.push(
      {
        pathname: router.pathname,
        query: query,
      },
      undefined,
      { shallow: true }
    );
  }

  return { addQueryParam, removeQueryParam };
}
