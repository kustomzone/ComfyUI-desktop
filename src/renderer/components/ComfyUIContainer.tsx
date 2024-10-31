import React, { useEffect, useRef } from 'react';
import { ElectronAPI } from 'src/preload';
import { ELECTRON_BRIDGE_API } from 'src/constants';
import { WebviewTag } from 'electron';

interface ComfyUIContainerProps {
  comfyPort: number;
  preloadScript: string;
}

const iframeContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  margin: '0',
  padding: '0',
};

const iframeStyle: React.CSSProperties = {
  flexGrow: 1,
  border: 'none',
  width: '100%',
  height: '100%',
};

const ComfyUIContainer: React.FC<ComfyUIContainerProps> = ({ comfyPort, preloadScript }) => {
  const webviewRef = useRef<WebviewTag>(null);

  useEffect(() => {
    const electronAPI: ElectronAPI = (window as any)[ELECTRON_BRIDGE_API];
    const webview = webviewRef.current;

    electronAPI.onOpenDevTools(() => {
      webviewRef.current?.openDevTools();
    });

    if (webview) {
      webview.addEventListener('dom-ready', () => {
        electronAPI.setWebviewWindowHandler(webview.getWebContentsId());
      });
    }
  }, []);

  return (
    <div style={iframeContainerStyle}>
      <webview
        id="comfy-container"
        src={`http://localhost:${comfyPort}`}
        style={iframeStyle}
        preload={`file://${preloadScript}`}
        ref={webviewRef}
        allowpopups={true}
      />
    </div>
  );
};

export default ComfyUIContainer;
