const { app } = require('@azure/functions');
var Client = require('azure-iothub').Client;
//var connectionString = process.env.IOTHUB_CONNECTION_STRING;
var connectionString = "HostName=KwiksHub.azure-devices.net;SharedAccessKeyName=PLCnextAXCF2152;SharedAccessKey=gtca4j1jqCU/wxluwd5/yiNv6gb4LsP92AIoTKo+z30="
var client = Client.fromConnectionString(connectionString);

app.http('PLCAPI', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            var payload = await request.text();
            var req = JSON.parse(payload)
            if(!req.hasOwnProperty("function")) {
                context.log("Poging tot verzoek zonder functie.")
                return {
                    status: 404
                }
            }
            else if(!req.hasOwnProperty("waterpeil")) {
                context.log("Poging tot zetten van waterpeil zonder getal.")
                return {
                    status: 400
                }
            }
            else {
                // PLC Azure Device aansturen
                console.log(req);
                var methodParams = {
                    methodName: "zetGrondwaterpeil",
                    payload: req,
                    responseTimeoutInSeconds: 15
                }
                client.invokeDeviceMethod("PLC", methodParams, function (err, result) {
                    if (err) {
                        console.error('Failed to invoke method \'' + methodParams.methodName + '\': ' + err.message);
                    }
                    else {
                        console.log(methodParams.methodName + ' on ' + targetDevice + ':');
                        console.log(JSON.stringify(result, null, 2));
                    }
                })
                return {
                    status: 200,
                    body: "Done"
                }
            }
        }
        catch(e) {
            context.log('Interne fout bij verwerken van verzoek van Dashboard');
            return {
                satus: 500,
                body: 'Interne serverfout bij verwerken van verzoek van Dashboard'
            }
        }
    }
});

/*
{"function":"zetGrondwaterpeil(int w)/zetReservoirwaterpeil(int w)", "waterpeil": int}
*/