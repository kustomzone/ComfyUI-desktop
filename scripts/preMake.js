const { exec, execSync, spawnSync, spawn } = require("child_process");
const path = require("path");
const os = require('os');
const process = require("process");
const fs = require('fs-extra');

module.exports = async ({ appOutDir, packager, outDir }) => {

 
    const firstInstallOnToDesktopServers =
    process.env.TODESKTOP_CI && process.env.TODESKTOP_INITIAL_INSTALL_PHASE;
    // Do NOT run on CI
    if (process.env.CI || firstInstallOnToDesktopServers) return;

    // Right now only for mac

    if (os.platform() !== 'darwin') return;

    // If there this file already lets assume comfy has already been installed
    if (fs.existsSync('./assets/python.tgz')) return; 
    
    spawnSync('yarn run make:assets:macos', [''], {shell:true,stdio:"inherit"});
    spawnSync('cd assets && comfy standalone --rehydrate', [''], {shell:true,stdio:"inherit"});
    spawnSync('cd assets && mkdir python2/ && tar -xzf python.tgz -C python2/ && rm python.tgz', [''], {shell:true,stdio:"inherit"});
    spawnSync('cd assets && mv python python3 && mv python2/python python && mkdir output && rm -rf python2 && rm -rf python3', [''], {shell:true,stdio:"inherit"});
    spawnSync('cd assets/python && filelist=("lib/libpython3.12.dylib" "lib/python3.12/lib-dynload/_crypt.cpython-312-darwin.so" "bin/uv" "bin/uvx" "bin/python3.12") && for file in ${filelist[@]}; do mkdir -p `dirname ../output/$file` && mv "$file" ../output/"$file"; done', [''], {shell:true,stdio:"inherit"});
    spawnSync('cd assets && tar -czf python.tgz python/ && rm -rf python', [''], {shell:true,stdio:"inherit"});
    console.log(">PREMAKE FINISH<");
}