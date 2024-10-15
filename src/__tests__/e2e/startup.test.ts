import { test, _electron as electron, expect, ElectronApplication, Page } from '@playwright/test';
import * as fsPromises from 'node:fs/promises';


let activeElectronApp: ElectronApplication = null;
let activeWindow:Page = null;

test("Move Assets Folder", async() => {
  await fsPromises.cp('./assets','.vite/build/assets',{recursive:true}); 
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
  await expect(activeWindow.getByText('Setting',{exact:false})).toBeVisible({timeout:20000});
  await expect(activeWindow).toHaveScreenshot('startup.png',);
});

test('Wait For Python Server', async () => {
  await activeWindow.waitForTimeout(5000);
  await expect(activeWindow.getByRole('heading', { name: 'ComfyUI' })).toBeEnabled({timeout:60000});
});

test('Close App', async () => {
  activeElectronApp.close();
});
