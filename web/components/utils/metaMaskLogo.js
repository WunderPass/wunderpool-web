import { useEffect } from 'react';
import { useRef } from 'react';
const ModelViewer = require('@metamask/logo');

export default function MetaMaskLogo({ width, height }) {
  const metamaskLogo = useRef(null);

  useEffect(() => {
    const viewer = ModelViewer({
      pxNotRatio: true,
      width,
      height,
      followMouse: true,
    });
    if (
      metamaskLogo.current?.children &&
      metamaskLogo.current.children.length == 0
    ) {
      metamaskLogo.current.innerHTML = '';
      metamaskLogo.current.appendChild(viewer.container);
    }
  }, []);

  return <div ref={metamaskLogo}></div>;
}
