import Link from 'next/link';
import { toast } from 'react-toastify';

export default function useNotification() {
  const stringifyError = (msg) => {
    if (!msg) {
      return 'Something went wrong';
    } else if (typeof msg == 'string') {
      return msg;
    } else if (typeof msg == 'object') {
      if (msg?.response?.data) {
        return stringifyError(msg.response.data);
      } else if (msg?.error?.error?.body) {
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

  const Msg = ({ msg, opts }) => (
    <div className="flex items-center justify-between">
      {msg}
      {opts.href && opts.btn && (
        <Link href={opts.href}>
          <button className="btn-casama py-1 px-3">{opts.btn}</button>
        </Link>
      )}
    </div>
  );

  const handleError = (msg, opts = {}) => {
    toast.error(stringifyError(msg));
  };

  const handleSuccess = (msg, opts = {}) => {
    toast.success(<Msg msg={msg} opts={opts} />);
  };

  const handleInfo = (msg, opts = {}) => {
    toast.info(<Msg msg={msg} opts={opts} />);
  };

  const handleWarning = (msg, opts = {}) => {
    toast.warn(<Msg msg={msg} opts={opts} />);
  };

  const handlePromise = (promise, success) => {
    toast.promise(promise, {
      pending: 'Waiting for Blockchain Transaction',
      success,
      error: {
        render({ data }) {
          return stringifyError(data);
        },
      },
    });
  };

  return [handleError, handleSuccess, handleInfo, handleWarning, handlePromise];
}
