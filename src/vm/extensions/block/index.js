/*

PaSoRich for Xcratch
20231214 - 1.5d(001)

*/


import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import translations from './translations.json';
import blockIcon from './block-icon.png';



// Variables
let pasoriDevice;

let nfcDevices = [];

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

        nfcDevices.push(null);

        console.log(PaSoRichVersion);


        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }


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

        isConnect = connectMessage;

        // 新しいデバイスをリクエストして配列に追加する
        navigator.usb.requestDevice({ filters: [{ vendorId: 0x054c }] })
            .then(device => {
                console.log("openPasori:", device);
                addNfcDevice(device);
                this.getDeviceNumberMenuItems();
                isConnect = formatMessage({
                    id: 'pasorich.ConnectConnected',
                    default: 'Connected...',
                    description: 'ConnectConnected'
                });

            });

            this.getDeviceNumberMenuItems();
            return isConnect;

    }

    setupDevice(device) {
        return device.open()
            .then(() => device.selectConfiguration(1))
            .then(() => device.claimInterface(0))
            .catch(error => {
                console.error('Error setting up the device:', error);
                throw error; // エラーを再スローして、チェーンを中断します。
            });
    }
    
    
    readPasori(args) {
        const deviceNumber = parseInt(args.DEVICE_NUMBER, 10);
        if (deviceNumber >= 0 && deviceNumber < nfcDevices.length) {
            const device = getNfcDeviceByNumber(deviceNumber);
            if (device) {
                if (device.opened) {
                    // デバイスが既に開かれている場合は、直接 session 処理を行います。
                    session(device);
                } else {
                    // デバイスが開かれていない場合は、セットアップを行います。
                    setupDevice(device)
                        .then(() => session(device))
                        .catch(error => {
                            console.error('Failed to setup or session the device:', error);
                        });
                }
            } else {
                console.error('Invalid device number');
            }
        } else {
            console.error('Device number out of range');
        }
    }

/*
    readPasori (args) {
        const deviceNumber = parseInt(args.DEVICE_NUMBER, 10);
        if (deviceNumber >= 0 && deviceNumber < nfcDevices.length) {
            const device = getNfcDeviceByNumber(deviceNumber);
            console.log("readPasori:", device);
            if (device && device.opened) {
                return session(device);
            }
        }
        // 適切なデバイスが見つからない場合や、デバイスが開かれていない場合のエラーハンドリング
        console.error('Invalid device number or device not opened');
    }
*/

    
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
                        default: 'read PaSoRi device [DEVICE_NUMBER]',
                        description: 'readPasori'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEVICE_NUMBER: {
                            type: ArgumentType.STRING,
                            menu: 'deviceNumberMenu',
                            defaultValue: '' // デフォルトのデバイス番号
                        }
                    }
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
                },
            ],
            menus: {
                deviceNumberMenu: {
                    acceptReporters: true,
                    items: 'getDeviceNumberMenuItems'
                }
            }
        };
    }
   
   
    // デバイス番号メニューの項目を生成する関数
    getDeviceNumberMenuItems() {

        console.log("getDeviceNumberMenuItems:", nfcDevices.length);
        //if (nfcDevices.length === 0) {
            // デバイスが登録されていない場合は空の配列を返します。
        //    return [];
        //}
        return nfcDevices.map((_, index) => ({
            text: index === 0 ?  ' ' : (index).toString(),
            value: index === 0 ? ' ' : (index).toString()
        }));
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
    console.log("session IN 0");
    await send(device, [0x00, 0x00, 0xff, 0x00, 0xff, 0x00]);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x2a, 0x01, 0xff, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    console.log("session IN 1");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x06, 0x00, 0x24, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    console.log("session IN 2");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x06, 0x00, 0x24, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    console.log("session IN 3");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x06, 0x00, 0xfa, 0xd6, 0x00, 0x01, 0x01, 0x0f, 0x01, 0x18, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    console.log("session IN 4");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x28, 0x00, 0xd8, 0xd6, 0x02, 0x00, 0x18, 0x01, 0x01, 0x02, 0x01, 0x03, 0x00, 0x04, 0x00, 0x05, 0x00, 0x06, 0x00, 0x07, 0x08, 0x08, 0x00, 0x09, 0x00, 0x0a, 0x00, 0x0b, 0x00, 0x0c, 0x00, 0x0e, 0x04, 0x0f, 0x00, 0x10, 0x00, 0x11, 0x00, 0x12, 0x00, 0x13, 0x06, 0x4b, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    console.log("session IN 5");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00, 0xfc, 0xd6, 0x02, 0x00, 0x18, 0x10, 0x00]);
    await receive(device, 6);
    await receive(device, 13);
    console.log("session IN 6");
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



// デバイスを追加する関数
function addNfcDevice(device) {
    // null デバイスを受け取った場合の処理
    if (device === null) {
        // 既に null デバイスが追加されているかチェックします。
        if (nfcDevices[0] === null) {
            // 既に null デバイスが存在する場合は何もせずに false を返します。
            return false;
        } else {
            // 配列の先頭に null デバイスを追加します。
            nfcDevices.unshift(null);
            return true;
        }
    }

    // 通常のデバイスを追加する処理
    // デバイスがすでに配列に存在するかどうかをチェックします。
    const existingDevice = nfcDevices.find(d => d && d.serialNumber === device.serialNumber);
    if (existingDevice) {
        // デバイスがすでに存在する場合は何もせずに false を返します。
        return false;
    }
    // デバイスを配列に追加します。
    nfcDevices.push(device);
    return true;
}


// デバイスを取得する関数（番号で取得）
function getNfcDeviceByNumber(deviceNumber) {
    // deviceNumber は配列のインデックスとして機能します。
    return nfcDevices[deviceNumber];
}

// デバイスを削除する関数（番号で削除）
function removeNfcDeviceByNumber(deviceNumber) {
    if (deviceNumber >= 0 && deviceNumber < nfcDevices.length) {
        let device = nfcDevices[deviceNumber];
        if (device.opened) {
            device.close();
        }
        // 配列から要素を削除します。
        nfcDevices.splice(deviceNumber, 1);
    }
}

// すべてのデバイスを閉じて削除する関数
function clearNfcDevices() {
    nfcDevices.forEach(device => {
        if (device.opened) {
            device.close();
        }
    });
    // 配列を空にします。
    nfcDevices = [];
}




export {
    Scratch3Pasorich as default,
    Scratch3Pasorich as blockClass
};
