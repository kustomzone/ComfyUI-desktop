import { app } from 'electron';
import { getExtraModelPathsConfigPath, readBasePathFromConfig } from '../config/extra_model_config';
import path from 'path';

export async function getBasePath(): Promise<string | null> {
  const modelConfigPath = getExtraModelPathsConfigPath();
  return readBasePathFromConfig(modelConfigPath);
}

export async function getPythonInstallPath(): Promise<string | null> {
  if (!app.isPackaged) {
    return path.join(app.getAppPath(), 'assets');
  }

  return getBasePath();
}

export async function getAppResourcesPath(): Promise<string> {
  if (!app.isPackaged) {
    return path.join(app.getAppPath(), 'assets');
  }

  return process.resourcesPath;
}
