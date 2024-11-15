import * as Sentry from '@sentry/electron/main';
import { SENTRY_URL_ENDPOINT } from '../constants';
import { graphics } from 'systeminformation';
import { ComfySettings } from '../config/comfySettings';
import { app, dialog } from 'electron';
import log from 'electron-log/main';

graphics()
  .then((graphicsInfo) => {
    const gpuInfo = graphicsInfo.controllers.map((gpu, index) => ({
      [`gpu_${index}`]: {
        vendor: gpu.vendor,
        model: gpu.model,
        vram: gpu.vram,
        driver: gpu.driverVersion,
      },
    }));

    // Combine all GPU info into a single object
    const allGpuInfo = Object.assign({}, ...gpuInfo);
    // Set Sentry context with all GPU information
    Sentry.setContext('gpus', allGpuInfo);
  })
  .catch((e) => {
    log.error('Error getting GPU info: ', e);
  });

export const initSentry = () => {
  Sentry.init({
    dsn: SENTRY_URL_ENDPOINT,
    async beforeSend(event, hint) {
      // Confirmed on frontend side.
      const comfySettings = await ComfySettings.getInstance();

      if (event.extra?.comfyUIExecutionError || comfySettings?.allowMetrics) {
        return event;
      }

      const { response } = await dialog.showMessageBox({
        title: 'Send Crash Statistics',
        message: `Would you like to send crash statistics to the team?`,
        buttons: ['Always send crash reports', 'Do not send crash report'],
      });

      return response === 0 ? event : null;
    },
    integrations: [
      Sentry.childProcessIntegration({
        breadcrumbs: ['abnormal-exit', 'killed', 'crashed', 'launch-failed', 'oom', 'integrity-failure'],
        events: ['abnormal-exit', 'killed', 'crashed', 'launch-failed', 'oom', 'integrity-failure'],
      }),
    ],
  });
};
