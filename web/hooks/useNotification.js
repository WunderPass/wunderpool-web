import { toast } from 'react-toastify';

export default function useNotification() {
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
    }
    return 'Somenthing went wrong';
  };

  const handleError = (msg, opts = {}) => {
    toast.error(stringifyError(msg));
  };

  const handleSuccess = (msg, opts = {}) => {
    toast.success(stringifyError(msg));
  };

  const handleInfo = (msg, opts = {}) => {
    toast.info(stringifyError(msg));
  };

  const handleWarning = (msg, opts = {}) => {
    toast.warn(stringifyError(msg));
  };

  return [handleError, handleSuccess, handleInfo, handleWarning];
}
