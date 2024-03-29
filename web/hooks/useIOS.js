import { useEffect } from 'react';
import { useState } from 'react';

export default function UseIOS() {
  const [isIOSApp, setIsIOSApp] = useState(false);
  const [appConnected, setAppConnected] = useState(false);
  const [appIsActive, setAppIsActive] = useState(false);
  const [hasBiometry, setHasBiometry] = useState('');

  const toggleFaceId = () => {
    if (!window.swiftJsBridgeV1.hasBiometryCallback)
      window.swiftJsBridgeV1.hasBiometryCallback = (biometry) => {
        setHasBiometry(biometry);
      };
    window.webkit.messageHandlers.swiftJsBridgeV1.postMessage(
      JSON.stringify({ func: 'hasBiometry' })
    );
  };

  const updateBackgroundColor = (bgColor, spinnerColor) => {
    if (!isIOSApp) return;
    window.webkit.messageHandlers.swiftJsBridgeV1.postMessage(
      JSON.stringify({ func: 'setBackgroundColor', parameter: bgColor })
    );
    window.webkit.messageHandlers.swiftJsBridgeV1.postMessage(
      JSON.stringify({
        func: 'setRefreshControlColor',
        parameter: spinnerColor,
      })
    );
  };

  const updateWunderId = (wunderId) => {
    if (!isIOSApp) return;
    if (wunderId) {
      window.webkit.messageHandlers.swiftJsBridgeV1.postMessage(
        JSON.stringify({ func: 'setWunderId', parameter: wunderId })
      );
    } else {
      window.webkit.messageHandlers.swiftJsBridgeV1.postMessage(
        JSON.stringify({ func: 'resetWunderId' })
      );
    }
  };

  const triggerBiometry = (reason, callback = () => {}) => {
    if (!window?.webkit?.messageHandlers?.swiftJsBridgeV1) callback(true);
    if (!window.swiftJsBridgeV1.triggerBiometryCallback)
      window.swiftJsBridgeV1.triggerBiometryCallback = (success) => {
        callback(success);
        window.swiftJsBridgeV1.triggerBiometryCallback = undefined;
      };
    window.webkit.messageHandlers.swiftJsBridgeV1.postMessage(
      JSON.stringify({ func: 'triggerBiometry', parameter: reason })
    );
  };

  useEffect(() => {
    window.swiftJsBridgeV1 = {};
    window.swiftJsBridgeV1.appIsConnected = (connected) => {
      setAppConnected(connected);
    };
    window.swiftJsBridgeV1.appWillBecomeActive = () => {
      setAppIsActive(true);
    };
    setIsIOSApp(Boolean(window.webkit?.messageHandlers?.swiftJsBridgeV1));
  }, []);

  return {
    isIOSApp,
    appConnected,
    appIsActive,
    hasBiometry,
    triggerBiometry,
    updateWunderId,
    updateBackgroundColor,
  };
}
