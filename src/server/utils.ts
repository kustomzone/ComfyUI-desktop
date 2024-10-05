import { BrowserWindow } from 'electron';
import log from 'electron-log/main';
import axios from 'axios';
import path from 'node:path';

export async function loadRendererIntoMainWindow(mainWindow: BrowserWindow): Promise<void> {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    log.info('Loading Vite Dev Server');
    return mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    return mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

export async function loadComfyUI(mainWindow: BrowserWindow, host: string, port: number): Promise<void> {
  return mainWindow.loadURL(`http://${host}:${port}`);
}

export async function isComfyServerReady(host: string, port: number): Promise<boolean> {
  const url = `http://${host}:${port}/queue`;

  try {
    const response = await axios.get(url, {
      timeout: 5000, // 5 seconds timeout
    });

    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      log.warn(`Server responded with status ${response.status} at ${url}`);
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      log.error(`Failed to connect to server at ${url}: ${error.message}`);
    } else {
      log.error(`Unexpected error when checking server at ${url}: ${error}`);
    }
    return false;
  }
}
