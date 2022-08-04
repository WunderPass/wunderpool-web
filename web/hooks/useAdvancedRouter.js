import { useRouter } from 'next/router';
import { useHistory } from './useHistory';

export default function UseAdvancedRouter() {
  const router = useRouter();
  const historyManager = useHistory();

  function goBack(fallBack) {
    if (historyManager.canGoBack()) {
      router.back();
    } else {
      fallBack();
    }
  }

  function addQueryParam(params, replace = true) {
    const newParams = Object.keys(params)
      .filter((key) => params[key] != null)
      .reduce((res, key) => ((res[key] = `${params[key]}`), res), {});
    if (replace) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, ...newParams },
        },
        undefined,
        { shallow: true }
      );
    } else {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, ...newParams },
        },
        undefined,
        { shallow: true }
      );
    }
  }

  function removeQueryParam(key, replace = true) {
    const query = {
      ...Object.fromEntries(
        Object.entries(router.query).filter(([k]) => k != key)
      ),
    };
    if (replace) {
      router.replace(
        {
          pathname: router.pathname,
          query: query,
        },
        undefined,
        { shallow: true }
      );
    } else {
      router.push(
        {
          pathname: router.pathname,
          query: query,
        },
        undefined,
        { shallow: true }
      );
    }
  }

  return { addQueryParam, removeQueryParam, goBack };
}
