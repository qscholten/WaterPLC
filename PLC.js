'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;

const Client = require('azure-iot-device').Client;
let client = null;

function main() {
    // open a connection to the device
    const deviceConnectionString = process.env.IOTHUB_DEVICE_CONNECTION_STRING_PLC;
    client = Client.fromConnectionString(deviceConnectionString, Protocol);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    client.open(onConnect);
}

function onConnect(err) {
    if(err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Connected to device. Registering handlers for methods.');

        // register handlers for all the method names we are interested in
        client.onDeviceMethod('zetGrondwaterpeil', onZetGrondwaterpeil);
    }
}

function onZetGrondwaterpeil(request, response) {
    printDeviceMethodRequest(request);

    try {
        var payload = request.payload;
        //PLC Aansturing
        console.log(payload);
    }
    catch (e) {
        console.error('Een fout ontstond bij het veranderen van het grondwaterpeil:\n' +
            err.toString());
    };
}

function printDeviceMethodRequest(request) {
    // print method name
    console.log('Received method call for method \'' + request.methodName + '\'');

    // if there's a payload just do a default console log on it
    if(request.payload) {
        console.log('Payload:\n' + request.payload);
    }
}

// get the app rolling
main();

