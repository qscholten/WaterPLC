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
        client.onDeviceMethod('zetGrondwaterpeil', onZetGrondwaterpeil);
    }
}

async function onZetGrondwaterpeil(request, response) {
    printDeviceMethodRequest(request);

    try {
        var payload = request.payload;
        // PLC Aansturing
        var peil = payload.waterpeil;
        console.log(peil);
        var auth = await authentication();
        console.log(auth);
        PLCGET(auth,"Waterklep1Status");
        // complete the response
        /*
        response.send(200, antwoord, function (err) {
            if(err) {
                console.error('An error ocurred when sending a method response:\n' +
                    err.toString());
            } else {
                console.log('Response to method \'' + request.methodName +
                    '\' sent successfully.' );
        }*/
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
            "password": "4f04e830"
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


  async function test() {
    try {
      const response = await axios.post("http://localhost:7071/api/kwik/", {
        "scope": "variables"
      }, {
        headers: {
        }
      });
  
      console.log('API Response:', response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  async function PLCGET(auth, variable) {
    var auth2 = "Bearer " + auth;
    console.log(auth2);
    var connstring = "https://192.168.1.10/_pxc_api/api/variables?paths=Arp.Plc.Eclr/" + variable;
    console.log(connstring);
    try {
      const response = await axios.get("https://192.168.1.10/_pxc_api/api/variables?paths=Arp.Plc.Eclr/Waterklep1Status", {
        'headers': {
          "Authorization": auth2
        }
      });
      console.log('API Response:', response.data);
    }
    catch (error) {
      console.error('Error GET:', error.message);
    }
  }