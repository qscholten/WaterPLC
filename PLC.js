'use strict';
const axios = require('axios');

const Protocol = require('azure-iot-device-mqtt').Mqtt;

const Client = require('azure-iot-device').Client;
let client = null;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
        client.onDeviceMethod('leesVariabel', onLeesVariabel);
        client.onDeviceMethod('schrijfVariabel', onSchrijfVariabel);
    }
}

async function onLeesVariabel(request, response) {
  printDeviceMethodRequest(request);
  console.log(request.payload);
  try {
    var auth = await authentication();
    var result = await PLCGET(auth, request.payload.naam);
    response.send(200, result, function (err) {
      if (err) {
        console.error('Bij het verzenden van een antwoord ontstond er een fout:\n' +
          err.toString()
        );
      }
      else {
        console.log('Antwoord op methodeaanroep \'' + request.methodName +
          '\' succesvol verzonden.' );
      }
    })
  }
  catch (e) {
    console.error('Een fout ontstond bij het lezen van een variabele: \n' + 
      err.toString());
  }
}

async function onSchrijfVariabel(request, response) {
  printDeviceMethodRequest(request);
  console.log(request.payload);
  try {
    if (request.payload.naam == "ToestemmingBoezem") {
      var authtemp = await authentication();
      var temp = await PLCPUT(authtemp, request.payload.naam, false);
    }
    var auth = await authentication();
    var result = await PLCPUT(auth, request.payload.naam, request.payload.waarde);
    response.send(200, result, function (err) {
      if (err) {
        console.error('Bij het verzenden van een antwoord ontstond er een fout:\n' +
          err.toString()
        );
      }
      else {
        console.log('Antwoord op methodeaanroep \'' + request.methodName +
          '\' succesvol verzonden.' );
      }
    })
  }
  catch (e) {
    console.error('Een fout ontstond bij het schrijven van een variabele: \n' + 
      err.toString());
  }
}

// get the app rolling
main();

async function authentication() {
    try {
      const responseauth = await axios.post("https://192.168.1.10/_pxc_api/v1.2/auth/auth-token", {
        "scope": "variables"
      }, {
        headers: {
        }
      });
      //console.log('API Auth Response:', responseauth.data);
      try {
        const auth = responseauth.data.code;
        const responseacc = await axios.post("https://192.168.1.10/_pxc_api/v1.2/auth/access-token", {
            "code": auth,
            "grant_type": "authorization_code",
            "username": "admin",
            "password": process.env.PLCPASSWORD
        });
        //console.log('API Acc Response:', responseacc.data);
        try {
            const acc = responseacc.data.access_token;
            return acc;
        }
        catch (error) {
            console.error('Error authentication:', error.message);
        }
      }
      catch (error) {
        console.error('Error authentication:', error.message);
      }
    } catch (error) {
      console.error('Error authentication:', error.message);
    }
  }

// Krijgt een authentication string en een variabele en returnt de waarde van de variabele
async function PLCGET(auth, variable) {
  var auth = "Bearer " + auth;
  var connstring = "https://192.168.1.10/_pxc_api/api/variables?paths=Arp.Plc.Eclr/" + variable;
  try {
    const response = await axios.get(connstring, {
      'headers': {
        "Authorization": auth
      }
    });
    //console.log('API GET Response:', response.data);
    return response.data.variables[0].value;
  }
  catch (error) {
    console.error('Error GET:', error.message);
  }
}

// Krijgt een authentication string, een variabele en een value en returnt de waarde van de variabele
async function PLCPUT(auth, variable, value) {
  //var auth = "Bearer " + auth;
  var connstring = "https://192.168.1.10/_pxc_api/api/variables";
  try {
    const response = await axios.put(connstring, {
      "pathPrefix": "Arp.Plc.Eclr/",
      "variables":
      [
        {
          "path": variable,
          "value": value,
          "valueType": "Constant"
        }
      ]
    }, {
      'headers': {
        "Authorization": auth
      }
    });
    return response.data.variables[0].value;
  }
  catch (error) {
    console.error ("Error PUT:", error.message);
  }
}

function printDeviceMethodRequest(request) {
  // print method name
  console.log('Received method call for method \'' + request.methodName + '\'');

  // if there's a payload just do a default console log on it
  if(request.payload) {
      console.log('Payload:\n' + request.payload);
  }
}