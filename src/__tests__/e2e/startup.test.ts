import { test, _electron as electron, expect, ElectronApplication, Page } from '@playwright/test';
import * as fsPromises from 'node:fs/promises';
import path from 'node:path';


let activeElectronApp: ElectronApplication = null;
let activeWindow:Page = null;

test("Move Assets Folder", async() => {
  await fsPromises.cp('./assets','.vite/build/assets',{recursive:true}); 
  await fsPromises.mkdir(path.join(process.env.APPDATA,'Electron'),{recursive:true});
  const extraConfig = path.join(process.env.APPDATA,'Electron' ,'extra_models_config.yaml');
  await fsPromises.writeFile(extraConfig,runnerWin32Config);
});

test("Open App" , async () => {
  activeElectronApp = await electron.launch({ args: [".vite/build/main.js"] });
  
});

test('Not Packed', async () => {
  const isPackaged = await activeElectronApp.evaluate(async ({ app }) => {
    // This runs in Electron's main process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.isPackaged;
  });

  expect(isPackaged).toBe(false);
});

test('Load Window', async () => {

  activeWindow = await activeElectronApp.firstWindow();
  await expect(activeWindow.getByText(new RegExp('^(Setting|Starting...)$'),{exact:false})).toBeVisible({timeout:20000});
 // await expect(activeWindow).toHaveScreenshot('startup.png',);
});

test('Wait For Python Server', async () => {
  await activeWindow.waitForTimeout(5000);
  await expect(activeWindow.getByRole('heading', { name: 'ComfyUI' })).toBeEnabled({timeout:240000});
});

test('Close App', async () => {
  activeElectronApp.close();
});

const runnerWin32Config = `
# ComfyUI extra_model_paths.yaml for win32
comfyui:
  base_path: C:\\Users\\runneradmin\\comfyui-electron
  is_default: true
  checkpoints: models/checkpoints/
  classifiers: models/classifiers/
  clip: models/clip/
  clip_vision: models/clip_vision/
  configs: models/configs/
  controlnet: models/controlnet/
  diffusers: models/diffusers/
  diffusion_models: models/diffusion_models/
  embeddings: models/embeddings/
  gligen: models/gligen/
  hypernetworks: models/hypernetworks/
  loras: models/loras/
  photomaker: models/photomaker/
  style_models: models/style_models/
  unet: models/unet/
  upscale_models: models/upscale_models/
  vae: models/vae/
  vae_approx: models/vae_approx/
  custom_nodes: custom_nodes/
`;