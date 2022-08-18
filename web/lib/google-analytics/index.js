export const pageview = (url) => {
  window.gtag('config', process.env.GA_TRACKING_CODE, { path_url: url });
};
