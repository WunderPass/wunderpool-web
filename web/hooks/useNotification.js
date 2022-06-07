import { useState, useEffect } from 'react';

export default function useNotification() {
  const [notification, setNotification] = useState({
    type: null,
    message: '',
    active: false,
    url: null,
    label: null,
  });

  const stringifyError = (msg) => {
    if (!msg) {
      return 'Something went wrong';
    } else if (typeof msg == 'string') {
      return msg;
    } else if (typeof msg == 'object') {
      if (msg?.error?.error?.body) {
        return stringifyError(JSON.parse(msg.error.error.body));
      } else if (msg?.message && typeof msg.message == 'string') {
        return msg.message;
      } else if (
        msg?.error?.message &&
        typeof msg?.error?.message == 'string'
      ) {
        return msg?.error?.message;
      }
      console.log(msg);
      console.log(Object.keys(msg));
    }
    console.log('Uncaught Error');
    console.log('Type:', typeof msg);
    console.log('ERR:', msg);
    return 'Somenthing went wrong';
  };

  const handleError = (msg, opts = {}) => {
    setNotification({
      type: 'error',
      message: stringifyError(msg),
      active: true,
      url: opts.url,
      label: opts.label,
    });
  };

  const handleSuccess = (msg, opts = {}) => {
    setNotification({
      type: 'success',
      message: msg,
      active: true,
      url: opts.url,
      label: opts.label,
    });
  };

  const handleInfo = (msg, opts = {}) => {
    setNotification({
      type: 'info',
      message: msg,
      active: true,
      url: opts.url,
      label: opts.label,
    });
  };

  const handleWarning = (msg, opts = {}) => {
    setNotification({
      type: 'warning',
      message: msg,
      active: true,
      url: opts.url,
      label: opts.label,
    });
  };

  useEffect(() => {
    if (!notification.active) return;
    setTimeout(() => {
      setNotification({
        type: null,
        message: '',
        active: false,
        url: null,
        label: null,
      });
    }, 10000);
  }, [notification]);

  return [notification, handleError, handleSuccess, handleInfo, handleWarning];
}
