/*

PaSoRich for Xcratch
20231214 - 1.0d(000)

*/


import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import translations from './translations.json';
import blockIcon from './block-icon.png';



// Variables
let pasoriDevice;
let idmNum = '';
let idmNumSha256 = '';
let deviceFlag = false;
let readingFlag = false;
let connectingCount = 0;
const intvalTimeShort = 12;
const PaSoRichVersion = "PaSoRich 1.0d";


/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = messageData => messageData.defaultMessage;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const EXTENSION_ID = 'pasorich';

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = 'https://con3code.github.io/dev-pasorich/dist/pasorich.mjs';

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class Scratch3Pasorich {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return formatMessage({
            id: 'pasorich.name',
            default: 'PaSoRich',
            description: 'name of the extension'
        });
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL () {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL (url) {
        extensionURL = url;
    }

    /**
     * Construct a set of blocks for PaSoRich.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }




        if (pasoriDevice !== undefined) {
            if(pasoriDevice.opened){
                pasoriDevice.close();
                //console.log("- pasoriDevice:" + pasoriDevice);
            }
        }

        navigator.usb.getDevices().then(devices => {
            //console.log(devices);
            devices.map(selectedDevice => {
                pasoriDevice = selectedDevice;
                pasoriDevice.open()
                .then(() =>
                    pasoriDevice.selectConfiguration(1)
                )
                .then(() =>
                    pasoriDevice.claimInterface(0)
                )
                .then(() => {
                   deviceFlag = true;
                })
                .catch((error) => {
                    deviceFlag = false;
                    console.log(error);
                });        
            });
        })
        .catch((error) => {
            deviceFlag = false;
            console.log(error);
        });

        
        if(pasoriDevice == null){

            let reqdevicePromise = navigator.usb.requestDevice({ filters: [{ vendorId: 0x054c }] });

            while(reqdevicePromise == undefined){
                sleep(intvalTimeShort);
            }

            if (reqdevicePromise !== undefined) {

                reqdevicePromise.then(selectedDevice => {
                    pasoriDevice = selectedDevice;
                    return pasoriDevice.open();
                })
                .then(() => {
                    return pasoriDevice.selectConfiguration(1);
                })
                .then(() => {
                    return pasoriDevice.claimInterface(0);
                })
                .then(() => {
                    deviceFlag = true;
                    sleep(intvalTimeShort);
                    return session(pasoriDevice);
                })
                .catch((error) => {
                    deviceFlag = false;
                    console.log(error);
                });

            }
        }

        console.log(PaSoRichVersion);




    }

    doIt (args) {
        const func = new Function(`return (${Cast.toString(args.SCRIPT)})`);
        const result = func.call(this);
        console.log(result);
        return result;
    }



    openPasori () {
        const connectMessage = formatMessage({
            id: 'pasorich.ConnectConnecting',
            default: 'Connecting...',
            description: 'ConnectConnecting'
        });
    
        if (deviceFlag || (pasoriDevice !== undefined && pasoriDevice !== null)) {
            connectingCount = 0;
            deviceFlag = true;
            isConnect = formatMessage({
                id: 'pasorich.ConnectConnected',
                default: 'Connected...',
                description: 'ConnectConnected'
            });
            return isConnect;
        }
    
        if(connectingCount >= 1){
            return connectMessage;
        }
    
        connectingCount += 1;
        isConnect = connectMessage;
    
        if (connectingCount > 1){
            return isConnect;
        }
    
        navigator.usb.requestDevice({ filters: [{ vendorId: 0x054c }] })
            .then(selectedDevice => {
                pasoriDevice = selectedDevice;
                return pasoriDevice.open();
            })
            .then(() => {
                return pasoriDevice.selectConfiguration(1);
            })
            .then(() => {
                deviceFlag = true;
                isConnect = formatMessage({
                    id: 'pasorich.ConnectConnected',
                    default: 'Connected...',
                    description: 'ConnectConnected'
                });    
                return pasoriDevice.claimInterface(0);
            })
            .catch(error => {
                pasoriDevice = null;
                deviceFlag = false;
                console.error(error);
            });

            return isConnect;
    }





readPasori () {
    if(readingFlag){return;}
    readingFlag = true;

    if(deviceFlag){
        if(pasoriDevice.opened && pasoriDevice !== null){
            sleep(intvalTimeShort);
            return session(pasoriDevice);
        }
        else {
            navigator.usb.getDevices()
                .then(devices => {
                    return Promise.all(devices.map(setupDevice));
                })
                .catch((error) => { 
                    deviceFlag = false;
                    readingFlag = false;
                    console.log(error);
                });
        }
    }
    else {
        navigator.usb.requestDevice({ filters: [{ vendorId: 0x054c }] })
            .then(setupDevice)
            .catch((error) => {
                deviceFlag = false;
                readingFlag = false;
                console.log(error);
            });
    }
}



    
    getIdm () {
        return idmNum;
    }
    
    
    resetIdm () {
        idmNum = '';
        idmNumSha256 ='';
        readingFlag = false;
        return;
    }
    
    



/**
 * Setup format-message for this extension.
 */
setupTranslations () {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            // eslint-disable-next-line no-use-before-define
            extensionTranslations[localeSetup.locale]
        );
    }
}







    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        setupTranslations();
        return {
            id: Scratch3Pasorich.EXTENSION_ID,
            name: Scratch3Pasorich.EXTENSION_NAME,
            extensionURL: Scratch3Pasorich.extensionURL,
            blockIconURI: blockIcon,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'openPasori',
                    text: formatMessage({
                        id: 'pasorich.Connect',
                        default: 'Connect',
                        description: 'openPasori'
                    }),
                    blockType: BlockType.REPORTER
                },
                '---',
                {
                    opcode: 'readPasori',
                    text: formatMessage({
                        id: 'pasorich.readPasori',
                        default: 'read PaSoRi',
                        description: 'readPasori'
                    }),
                    blockType: BlockType.COMMAND,
                },
               '---',
               {
                    opcode: 'getIdm',
                    text: formatMessage({
                        id: 'pasorich.getIdm',
                        default: 'IDm',
                        description: 'getIdm'
                    }),
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'resetIdm',
                    text: formatMessage({
                        id: 'pasorich.resetIdm',
                        default: 'reset IDm',
                        description: 'reset IDm and Variables'
                    }),
                    blockType: BlockType.COMMAND,
                }
            ],
            menus: {
            }
        };
    }
}



let isConnect = formatMessage({
    id: 'pasorich.push2Connect',
    default: 'Push to Connect.',
    description: 'push2Connect'
});



function hexString(textStr) {
    const byteArray = new Uint8Array(textStr);
    const hexCodes = [...byteArray].map(value => {
        const hexCode = value.toString(16);
        const paddedHexCode = hexCode.padStart(2, '0');
        return paddedHexCode;
    });
    return hexCodes.join('');
}

function sleep(msec) {
    return new Promise(resolve =>
        setTimeout(() => {
            resolve();
        }, msec)
    );
}


async function send(device, data) {
    let uint8a = new Uint8Array(data);
    await device.transferOut(2, uint8a);
    await sleep(10);
  }
  
  async function receive(device, len) {
    let data = await device.transferIn(1, len);
    await sleep(10);
    let arr = [];
    for (let i = data.data.byteOffset; i < data.data.byteLength; i++) {
      arr.push(data.data.getUint8(i));
    }
    return arr;
  }


  async function setupDevice(selectedDevice) {
    pasoriDevice = selectedDevice;
    await pasoriDevice.open();
    await pasoriDevice.selectConfiguration(1);
    await pasoriDevice.claimInterface(0);
    deviceFlag = true;
    sleep(intvalTimeShort);
    return session(pasoriDevice);
}




async function session(device) {
    await send(device, [0x00, 0x00, 0xff, 0x00, 0xff, 0x00]);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x2a, 0x01, 0xff, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x06, 0x00, 0x24, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x06, 0x00, 0x24, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x06, 0x00, 0xfa, 0xd6, 0x00, 0x01, 0x01, 0x0f, 0x01, 0x18, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x28, 0x00, 0xd8, 0xd6, 0x02, 0x00, 0x18, 0x01, 0x01, 0x02, 0x01, 0x03, 0x00, 0x04, 0x00, 0x05, 0x00, 0x06, 0x00, 0x07, 0x08, 0x08, 0x00, 0x09, 0x00, 0x0a, 0x00, 0x0b, 0x00, 0x0c, 0x00, 0x0e, 0x04, 0x0f, 0x00, 0x10, 0x00, 0x11, 0x00, 0x12, 0x00, 0x13, 0x06, 0x4b, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00, 0xfc, 0xd6, 0x02, 0x00, 0x18, 0x10, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x0a, 0x00, 0xf6, 0xd6, 0x04, 0x6e, 0x00, 0x06, 0x00, 0xff, 0xff, 0x01, 0x00, 0xb3, 0x00]);
    await receive(device, 6);

    let idm = (await receive(device, 37)).slice(17, 25);
    if (idm.length > 0) {
      let idmStr = '';
      for (let i = 0; i < idm.length; i++) {
        if (idm[i] < 16) {
          idmStr += '0';
        }
        idmStr += idm[i].toString(16);
      }

        //console.log("IDm: " + idmStr);
        idmNum = JSON.parse(JSON.stringify(idmStr));


        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(idmNum))
        .then(idmNumStr => {
            idmNumSha256 = hexString(idmNumStr);
            //console.log("HashedIDm: " + idmNumSha256);
        });
        readingFlag = false;
      
    } else {

        idmNum = '';
        idmNumSha256 = '';
        readingFlag = false;

    }

}




export {
    Scratch3Pasorich as default,
    Scratch3Pasorich as blockClass
};
