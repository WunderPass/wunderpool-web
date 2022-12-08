export const pageview = (url) => {
  window.gtag('config', process.env.GA_TRACKING_CODE, { path_url: url });
};

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
