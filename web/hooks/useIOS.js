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

  const triggerBiometry = (reason, callback = () => {}) => {
    if (!isIOSApp) callback(true);
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
    setIsIOSApp(Boolean(window.webkit?.messageHandlers));
  }, []);

  return {
    isIOSApp,
    appConnected,
    appIsActive,
    hasBiometry,
    triggerBiometry,
  };
}
