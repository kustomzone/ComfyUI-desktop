const { spawnSync } = require('child_process');
const os = require('os');
const process = require('process');

async function postInstall() {
  const firstInstallOnToDesktopServers = process.env.TODESKTOP_CI && process.env.TODESKTOP_INITIAL_INSTALL_PHASE;

  console.log('Post Install', os.platform());
  if (!firstInstallOnToDesktopServers) return;

  if (os.platform() === 'win32') {
    // Change stdio to get back the logs if there are issues.
    const resultUpgradePip = spawnSync(`py`, ['-3.12', '-m', 'pip', 'install', '--upgrade pip'], {
      shell: true,
      stdio: 'ignore',
    }).toString();
    const resultInstallComfyCLI = spawnSync(`py`, ['-3.12 ', '-m', 'pip', 'install comfy-cli'], {
      shell: true,
      stdio: 'ignore',
    }).toString();
    console.log('Finish PIP & ComfyCLI Install');
    const resultComfyManagerInstall = spawnSync(
      'set PATH=C:\\hostedtoolcache\\windows\\Python\\3.12.7\\x64\\Scripts;%PATH% && yarn run make:assets:nvidia',
      [''],
      { shell: true, stdio: 'inherit' }
    ).toString();
    console.log('Finish Comfy Manager Install and Rehydration');
  }

  if (os.platform() === 'darwin') {
    const resultUpgradePip = spawnSync(`python3`, ['-m', 'pip', 'install', '--upgrade pip'], {
      shell: true,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    const resultInstallComfyCLI = spawnSync(`python3`, ['-m', 'pip', 'install comfy-cli'], {
      shell: true,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    const resultComfyManagerInstall = spawnSync('yarn run make:assets:macos', [''], {
      shell: true,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    // Do not delete, useful if there are build issues with mac
    // TODO: Consider making a global build log as ToDesktop logs can be hit or miss

    fs.createFileSync('./assets/macpip.json');
    fs.writeFileSync(
      './assets/macpip.json',
      JSON.stringify({
        upgradeOut: {
          log: resultUpgradePip.stdout,
          err: resultUpgradePip.stderr,
        },
        installComfOut: {
          log: resultInstallComfyCLI.stdout,
          err: resultInstallComfyCLI.stderr,
        },
        ComfManInstallOut: {
          log: resultComfyManagerInstall.stdout,
          err: resultComfyManagerInstall.stderr,
        },
      })
    );

    console.log('Finish Python & Comfy Install for Mac');
  }
}

postInstall();
