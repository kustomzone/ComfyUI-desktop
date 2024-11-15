import * as fs from 'fs';
import * as path from 'path';
import log from 'electron-log/main';
import { getBasePath } from '../install/resourcePaths';

interface ComfySettingsData {
  'Comfy-Desktop.AutoUpdate'?: boolean;
  'Comfy-Desktop.AllowMetrics'?: boolean;
  'Comfy.ColorPalette'?: string;
  'Comfy.UseNewMenu'?: string;
  'Comfy.Workflow.WorkflowTabsPosition'?: string;
  'Comfy.Workflow.ShowMissingModelsWarning'?: boolean;
  [key: string]: any;
}

export const SETTINGS_KEYS = {
  AUTO_UPDATE: 'Comfy-Desktop.AutoUpdate',
  ALLOW_METRICS: 'Comfy-Desktop.AllowMetrics',
} as const;

/**
 * ComfySettings is a class that loads settings from the comfy.settings.json file.
 */
export class ComfySettings {
  private filePath: string;
  private settings: ComfySettingsData;

  private static instance: ComfySettings;

  private static readonly DEFAULT_CONFIG = {
    'Comfy.ColorPalette': 'dark',
    'Comfy.UseNewMenu': 'Top',
    'Comfy.Workflow.WorkflowTabsPosition': 'Topbar',
    'Comfy.Workflow.ShowMissingModelsWarning': true,
  };

  private constructor(settingsPath: string) {
    this.filePath = path.join(settingsPath, 'user', 'default', 'comfy.settings.json');
    this.settings = this.loadSettings();
  }

  public static async getInstance(): Promise<ComfySettings | null> {
    if (ComfySettings.instance) {
      return ComfySettings.instance;
    }

    const basePath = await getBasePath();
    if (!basePath) {
      return null;
    }
    ComfySettings.instance = new ComfySettings(basePath);
    return ComfySettings.instance;
  }

  private loadSettings(): ComfySettingsData {
    if (!fs.existsSync(this.filePath)) {
      log.info(`Settings file ${this.filePath} does not exist`);
      const dirPath = path.dirname(this.filePath);
      fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(ComfySettings.DEFAULT_CONFIG, null, 2));
      return { ...ComfySettings.DEFAULT_CONFIG };
    }
    try {
      const fileContent = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      log.error(`Failed to load settings from ${this.filePath}:`, error);
      return {};
    }
  }

  private updateSetting(key: string, value: any): void {
    try {
      this.loadSettings();

      log.info(`Updating setting ${key} to ${value}`);
      this.settings[key] = value;

      const dirPath = path.dirname(this.filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      const jsonContents = JSON.stringify(this.settings, null, 2);
      fs.writeFileSync(this.filePath, jsonContents);
      log.info(`Wrote file ${jsonContents} at ${this.filePath}`);
      this.reload();
    } catch (error) {
      log.error(`Failed to update setting ${key}:`, error);
    }
  }

  get autoUpdate(): boolean {
    this.reload();
    return this.settings[SETTINGS_KEYS.AUTO_UPDATE] ?? true;
  }

  set autoUpdate(value: boolean) {
    this.updateSetting(SETTINGS_KEYS.AUTO_UPDATE, value);
  }

  get allowMetrics(): boolean {
    this.reload();
    return this.settings[SETTINGS_KEYS.ALLOW_METRICS] ?? false;
  }

  set allowMetrics(value: boolean) {
    this.updateSetting(SETTINGS_KEYS.ALLOW_METRICS, value);
  }

  public reload(): void {
    this.settings = this.loadSettings();
  }

  public getAllDesktopSettings(): Record<string, any> {
    return Object.entries(this.settings)
      .filter(([key]) => key.startsWith('Comfy-Desktop.'))
      .reduce(
        (acc, [key, value]) => {
          const settingName = key.replace('Comfy-Desktop.', '');
          acc[settingName] = value;
          return acc;
        },
        {} as Record<string, any>
      );
  }
}
