/*

PaSoRich for Xcratch
20231215 - 1.5d(002)

*/


import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import translations from './translations.json';
import blockIcon from './block-icon.png';



// Variables
const pasoriDevice = {
    1729 : {
        vendorId: 0x054c,
        productId: 0x06C1,
        modelType: '380S',
        modelName: 'RC-S380/S'
    },
    1731 : {
        vendorId: 0x054c,
        productId: 0x06C3,
        modelType: '380P',
        modelName: 'RC-S380/P'
    },
    3528 : {
        vendorId: 0x054c,
        productId: 0x0dc8,
        modelType: '300S',
        modelName: 'RC-S300/S'
    },
    3529 : {
        vendorId: 0x054c,
        productId: 0x0dc9,
        modelType: '380P',
        modelName: 'RC-S300/P'
    },
}

let nfcDevices = [];
let deviceOpening = false;

const PaSoRichVersion = "PaSoRich 1.5d";


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

        //nfcDevices.push(null);

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
        if(deviceOpening) {
            return;
        }

        return new Promise((resolve, reject) => {
            deviceOpening = true;
            //console.log("openPasori:", device);
            const connectMessage = formatMessage({
                id: 'pasorich.ConnectConnecting',
                default: 'Connecting...',
                description: 'ConnectConnecting'
            });

            isConnect = connectMessage;
            

            var usbDeviceConnect = async () => {
                const usbDevice = await navigator.usb.getDevices();
            }

            usbDeviceConnect();

            // 新しいデバイスをリクエストして配列に追加する
            navigator.usb.requestDevice({ filters: [{ vendorId: 0x054c }] })
                .then(device => {
                    //console.log("requestDevice:", nfcDevices);
                    const existingDevice = nfcDevices.find(d => d && d.device.serialNumber === device.serialNumber);
                    //console.log("existingDevice:", existingDevice);
                    if (existingDevice) {
                        // デバイスがすでに存在する場合は何もせずに false を返します。
                        deviceOpening = false;
                        resolve(false);

                    } else {

                        console.log("openPasori:", device);
                        addNfcDevice(device);
                        this.getDeviceNumberMenuItems();
                        isConnect = formatMessage({
                            id: 'pasorich.ConnectConnected',
                            default: 'Connected...',
                            description: 'ConnectConnected'
                        });
                        deviceOpening = false;
                        resolve(isConnect);
                    }
                })
                .catch(error => {
                    deviceOpening = false;
                    reject(error);
                });

                this.getDeviceNumberMenuItems();
                reject(isConnect);
        });

    }



/*

    readPasori(args) // -> Scratch3Pasorich.prototype.readPasori

*/


    
    getIdm (args) {
        return getIdmNum(args.DEVICE_NUMBER);
    }
    
    
    resetIdm () {

        console.log("resetPasoriBefor:", nfcDevices);

        nfcDevices.forEach(nfc => {
            nfc.idmNum = '';
            return nfc.device.close();
        });

/*
        idmNum = '';
        idmNumSha256 ='';
*/
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
            color1: '#44c8aa',
            color2: '#44c8aa',
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
                            defaultValue: '1' // デフォルトのデバイス番号
                        }
                    }
                },
               {
                    opcode: 'getIdm',
                    text: formatMessage({
                        id: 'pasorich.getIdm',
                        default: 'IDm of [DEVICE_NUMBER]',
                        description: 'getIdm'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DEVICE_NUMBER: {
                            type: ArgumentType.STRING,
                            menu: 'deviceNumberMenu',
                            defaultValue: '1' // デフォルトのデバイス番号
                        }
                    }
                },
                '---',
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
        //console.log("getDeviceNumberMenuItems:", nfcDevices.length);
        if (nfcDevices.length === 0) {
            // デバイスが登録されていない場合は空の配列を返します。
            return [{
                text: ' ',
                value: ' '
            }];
        } else {
            return nfcDevices.map((_, index) => ({
                text: (index + 1).toString(),
                value: (index + 1).toString()
            }));
    
        }
    }


}



class AsyncQueue {
    constructor() {
        this.queue = [];
        this.pendingPromise = false;
    }

    async enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push(() => task().then(resolve).catch(reject));

            if (!this.pendingPromise) {
                this.pendingPromise = true;
                this.dequeue();
            }
        });
    }

    async dequeue() {
        if (this.queue.length === 0) {
            this.pendingPromise = false;
            return;
        }

        const task = this.queue.shift();
        try {
            await task();
        } catch (e) {
            console.error('Error during async task execution:', e);
        } finally {
            this.dequeue();
        }
    }
}



let isConnect = formatMessage({
    id: 'pasorich.push2Connect',
    default: 'Push to Connect.',
    description: 'push2Connect'
});


async function setupDevice(device) {

    let confValue = device.configuration.configurationValue;
    console.log("configurationValue:", confValue);
    let interfaceNum = device.configuration.interfaces[confValue - 1].interfaceNumber;	// インターフェイス番号
    console.log("interfaceNumber:", interfaceNum);

    try {
        await device.open(); // デバイスを開く
        await device.selectConfiguration(confValue); // 1 - device.configuration.configurationValue
        await device.claimInterface(interfaceNum); // インターフェース0をクレームする
        // その他のセットアップが必要な場合はここに追加
    } catch (error) {
        console.error('Error setting up the device:', error);
    }
    return device;
}



// キューインスタンスを作成
const readPasoriQueue = new AsyncQueue();

// readPasori関数をキューシステムでラップ
Scratch3Pasorich.prototype.readPasori = function(args) {
    return readPasoriQueue.enqueue(() => this.readPasoriTask(args));
};

// 実際のreadPasoriの処理を行う関数
Scratch3Pasorich.prototype.readPasoriTask = function(args) {
    // 元のreadPasori関数の処理をここに移動
    return new Promise((resolve, reject) => {
        if (args.DEVICE_NUMBER === '') { resolve('No Device'); }

        const deviceNumber = parseInt(args.DEVICE_NUMBER, 10);
        if (deviceNumber > 0 && deviceNumber <= nfcDevices.length) {
            const device = getNfcDeviceByNumber(deviceNumber);
            if (device) {
                if (device.opened) {
                    // デバイスが既に開かれている場合は、直接 session 処理を行います。
                    session(device)
                        .then(resolve)
                        .catch(reject);
                } else {
                    // デバイスが開かれていない場合は、セットアップを行います。
                    setupDevice(device)
                        .then(() => session(device))
                        .then(resolve)
                        .catch(error => {
                            console.error('Failed to setup or session the device:', error);
                            reject(error);
                        });
                }
            } else {
                console.error('Invalid device number');
                reject(new Error('Invalid device number'));
            }
        } else {
            console.error('Device number out of range');
            reject(new Error('Device No. out of range'));
        }
    });
};


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


async function session(device) {
    //console.log("session IN");



    await send(device, [0x00, 0x00, 0xff, 0x00, 0xff, 0x00]);
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x2a, 0x01, 0xff, 0x00]); //SetCommandType
    await receive(device, 6);
    await receive(device, 13);
    //console.log("session IN 1");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x06, 0x00, 0x24, 0x00]); //SwitchRF
    await receive(device, 6);
    await receive(device, 13);
    //console.log("session IN 2");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x03, 0x00, 0xfd, 0xd6, 0x06, 0x00, 0x24, 0x00]); //SwitchRF
    await receive(device, 6);
    await receive(device, 13);
    //console.log("session IN 3");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x06, 0x00, 0xfa, 0xd6, 0x00, 0x01, 0x01, 0x0f, 0x01, 0x18, 0x00]); //InSetRF
    await receive(device, 6);
    await receive(device, 13);
    //console.log("session IN 4");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x28, 0x00, 0xd8, 0xd6, 0x02, 0x00, 0x18, 0x01, 0x01, 0x02, 0x01, 0x03, 0x00, 0x04, 0x00, 0x05, 0x00, 0x06, 0x00, 0x07, 0x08, 0x08, 0x00, 0x09, 0x00, 0x0a, 0x00, 0x0b, 0x00, 0x0c, 0x00, 0x0e, 0x04, 0x0f, 0x00, 0x10, 0x00, 0x11, 0x00, 0x12, 0x00, 0x13, 0x06, 0x4b, 0x00]); //InSetProtocol
    await receive(device, 6);
    await receive(device, 13);
    //console.log("session IN 5");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x04, 0x00, 0xfc, 0xd6, 0x02, 0x00, 0x18, 0x10, 0x00]); //InSetProtocol
    await receive(device, 6);
    await receive(device, 13);
    //console.log("session IN 6");
    await send(device, [0x00, 0x00, 0xff, 0xff, 0xff, 0x0a, 0x00, 0xf6, 0xd6, 0x04, 0x6e, 0x00, 0x06, 0x00, 0xff, 0xff, 0x01, 0x00, 0xb3, 0x00]); //InCommRF
    await receive(device, 6);

    //console.log("session Idm");
    let idm = (await receive(device, 37)).slice(17, 25);
    if (idm.length > 0) {
      let idmStr = '';
      for (let i = 0; i < idm.length; i++) {
        if (idm[i] < 16) {
          idmStr += '0';
        }
        idmStr += idm[i].toString(16);
      }

        let idmNum = JSON.parse(JSON.stringify(idmStr));
        await setIdmNum(device, idmNum);
      
    } else {

        await setIdmNum(device, '');

    }

/*
        if (!crypto || !crypto.subtle) {
            throw Error("crypto.subtle is not supported.");
        }

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(idmNum))
        .then(idmNumStr => {
            idmNumSha256 = hexString(idmNumStr);
            //console.log("HashedIDm: " + idmNumSha256);
        });

*/

}


// 特定のデバイスのidmNumを取得する関数
function getIdmNum(deviceNumber) {
    //console.log("getIdmNum:", deviceNumber);
    if (deviceNumber > 0 && deviceNumber <= nfcDevices.length) {
        //console.log("getIdmNumNfc:", nfcDevices);
        return nfcDevices[deviceNumber - 1].idmNum;
    }
    return null; // 範囲外の場合はnullを返す
}


// 特定のデバイスのidmNumを設定する関数
function setIdmNum(device, idmNum) {
    const deviceIndex = nfcDevices.findIndex(d => d.device && d.device.serialNumber === device.serialNumber);
    console.log("IDm", deviceIndex + 1, ": ", idmNum);
    //console.log("setIdmIdx:", deviceIndex);
    if (deviceIndex !== -1) {
        nfcDevices[deviceIndex].idmNum = idmNum;
    }
}



function addNfcDevice(device) {
    if (device instanceof USBDevice) {
        // 通常のデバイスを追加する処理
        const existingDevice = nfcDevices.find(d => d && d.serialNumber === device.serialNumber);
        if (existingDevice) {
            // デバイスがすでに存在する場合は何もせずに false を返します。
            return false;
        }
        // デバイスとそれに関連するidmNumをオブジェクトとして配列に追加します。
        nfcDevices.push({ device: device, idmNum: '' });
        return true;
    } else {
        console.error('The provided object is not a USBDevice instance.');
    }
}




// デバイスを取得する関数（番号で取得）
function getNfcDeviceByNumber(deviceNumber) {
    // deviceNumber は配列のインデックスとして機能します。
    return nfcDevices[deviceNumber - 1].device;
}

// デバイスを削除する関数（番号で削除）
function removeNfcDeviceByNumber(deviceNumber) {
    if (deviceNumber > 0 && deviceNumber <= nfcDevices.length) {
        let device = nfcDevices[deviceNumber - 1];
        if (device.opened) {
            device.close();
        }
        // 配列から要素を削除します。
        nfcDevices.splice(deviceNumber - 1, 1);
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


export {
    Scratch3Pasorich as default,
    Scratch3Pasorich as blockClass
};
