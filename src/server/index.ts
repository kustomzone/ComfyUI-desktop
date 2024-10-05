import { BrowserWindow } from 'electron';
import log from 'electron-log/main';
import { loadRendererIntoMainWindow, isComfyServerReady, loadComfyUI } from './utils';

export enum ServerState {
  Unknown,
  Starting,
  Up,
  Down,
}

export class ServerMonitor {
  private serverState: ServerState = ServerState.Unknown;
  private isLoadingUI: boolean = false;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private mainWindow: BrowserWindow | null = null;
  private readonly host: string;
  private readonly port: number;
  private readonly heartbeatInterval: number;

  constructor(mainWindow: BrowserWindow, host: string, port: number, heartbeatInterval: number = 5000) {
    this.mainWindow = mainWindow;
    this.host = host;
    this.port = port;
    this.heartbeatInterval = heartbeatInterval;
  }

  public start(state: ServerState = ServerState.Unknown): void {
    this.serverState = state;
    log.info('Starting server monitor with state: ', this.serverState);
    this.heartbeat();
  }

  public stop(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private async heartbeat(): Promise<void> {
    if (this.isLoadingUI) {
      this.scheduleNextHeartbeat();
      return;
    }

    const isReady = await this.isServerReady();
    log.info('Comfy Server heartbeat: ', isReady);

    const previousState = this.serverState;
    this.serverState = isReady ? ServerState.Up : ServerState.Down;

    if (previousState === ServerState.Up && this.serverState === ServerState.Down) {
      this.isLoadingUI = true;
      try {
        log.info('Server went down, loading renderer into main window');
        await this.loadRenderer();
      } finally {
        this.isLoadingUI = false;
      }
    } else if (
      (previousState === ServerState.Starting || previousState === ServerState.Down) &&
      this.serverState === ServerState.Up
    ) {
      this.isLoadingUI = true;
      try {
        log.info('Server is up, loading ComfyUI into main window');
        await this.loadComfy();
      } finally {
        this.isLoadingUI = false;
      }
    } else {
      log.info(
        `No UI change needed for transition from ${ServerState[previousState]} to ${ServerState[this.serverState]}`
      );
    }

    this.scheduleNextHeartbeat();
  }

  private scheduleNextHeartbeat(): void {
    this.heartbeatTimeout = setTimeout(() => this.heartbeat(), this.heartbeatInterval);
  }

  private async isServerReady(): Promise<boolean> {
    return isComfyServerReady(this.host, this.port);
  }

  private async loadComfy(): Promise<void> {
    if (!this.mainWindow) {
      log.error('Trying to load ComfyUI into main window but it is not ready yet.');
      return;
    }
    await loadComfyUI(this.mainWindow, this.host, this.port);
  }

  private async loadRenderer(): Promise<void> {
    if (!this.mainWindow) {
      log.error('Trying to load renderer into main window but it is not ready yet.');
      return;
    }
    await loadRendererIntoMainWindow(this.mainWindow);
  }
}
