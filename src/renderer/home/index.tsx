import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require("electron"); //Not sure why It has not been working with 'import'

import TabOne from './tab1';
import TabTwo from './comfyTab';
import TabThree from './tab3';


function tabStyle(active: boolean): React.CSSProperties {
    return ({
        backgroundColor: active ? '#878787' : '#474747'
    });
}


function getTab(tabOn: number): any {
    switch (tabOn) {
        case 0:
            return <TabOne />;
        case 1:
            return <TabTwo />;
        case 2:
            return <TabThree />;
    };
}

function Home(): React.ReactElement {

    const [tabOn, setTab] = useState<number>(0);
    const [pythonServerStatus, setPythonServerStatus] = useState<boolean>(false);

    // Sets up a listener to read the server status messages coming from Main
    useEffect(() => {
        ipcRenderer.on('python-server-status', (event, args) => {
            setPythonServerStatus(args === 'active');
        });
        return () => {
            ipcRenderer.removeAllListeners('python-server-status');
        };
    });

    return (
    <div style={{ backgroundColor: '#474747' }}>
        <h1 style={{ color: 'white' }}>Home</h1>
        <div style={{ height: '2em' }}>
            <div style={{ display: 'inline', color: pythonServerStatus ? 'green' : 'red' }}>◉</div>
            {
                !pythonServerStatus ? <div style={{ display: 'inline' }}>Connecting... ⟳</div> : "Connected"
            }
        </div>
        <div style={{ width: '100%', padding: '0 1px', backgroundColor: '#373737' }}>
            <button style={tabStyle(tabOn == 0)} onClick={() => setTab(0)} >Tab One</button>
            <button style={tabStyle(tabOn == 1)} onClick={() => setTab(1)} >Tab Comfy</button>
            <button style={tabStyle(tabOn == 2)} onClick={() => setTab(2)} >Tab Comfy 2</button>
        </div>
        <div style={{ width: '100%', height: '500px', border: 'black 1px solid' }}>
            {
                getTab(tabOn)
            }
        </div>
    </div>
    );
}

export default Home;