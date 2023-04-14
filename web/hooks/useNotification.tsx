import Link from 'next/link';
import { toast } from 'react-toastify';
import axios from 'axios';

type MsgOptions = { href?: string; btn?: string };

export namespace UseNotification {
  export type handleError = (
    msg: any,
    wunderId?: string,
    userName?: string
  ) => void;
  export type handleSuccess = (msg: string, opts?: MsgOptions) => void;
  export type handleInfo = (msg: string, opts?: MsgOptions) => void;
  export type handleWarning = (msg: string, opts?: MsgOptions) => void;
  export type handlePromise = (
    promise: Promise<unknown> | (() => Promise<unknown>),
    success: string
  ) => void;
}

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

  const Msg = ({ msg, opts }: { msg: string; opts: MsgOptions }) => (
    <div className="flex items-center justify-between">
      {msg}
      {opts.href && opts.btn && (
        <Link href={opts.href}>
          <button className="btn-casama py-1 px-3">{opts.btn}</button>
        </Link>
      )}
    </div>
  );

  const handleError = (msg, wunderId?: string, userName?: string) => {
    if (wunderId) {
      axios({
        method: 'post',
        url: '/api/discord/errors',
        data: {
          error: msg,
          wunderId: wunderId || 'Unknown',
          userName: userName || 'Unknown',
        },
      })
        .then(console.log)
        .catch(console.log);
    }
    toast.error(stringifyError(msg));
  };

  const handleSuccess = (msg: string, opts: MsgOptions = {}) => {
    toast.success(<Msg msg={msg} opts={opts} />);
  };

  const handleInfo = (msg: string, opts: MsgOptions = {}) => {
    toast.info(<Msg msg={msg} opts={opts} />);
  };

  const handleWarning = (msg: string, opts: MsgOptions = {}) => {
    toast.warn(<Msg msg={msg} opts={opts} />);
  };

  const handlePromise = (
    promise: Promise<unknown> | (() => Promise<unknown>),
    success: string
  ) => {
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
