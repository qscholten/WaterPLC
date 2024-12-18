const { app } = require('@azure/functions');
var Client = require('azure-iothub').Client;
var connectionString = process.env.IOTHUB_CONNECTION_STRING;
var client = Client.fromConnectionString(connectionString);

var leesvariabelen = {"variabelen": [
    {
        "naam": "Grondwaterpeil"
    },
    {
        "naam": "Reservoirpeil"
    },
    {
        "naam": "Grondwaterstand"
    },
    {
        "naam": "Reservoirstand"
    },
    {
        "naam": "Noodstop"
    }
]}

var schrijfvariabelen = {"variabelen": [
    {
        "naam": "Grondwaterpeil"
    },
    {
        "naam": "Reservoirpeil"
    },
    {
        "naam": "ToestemmingBoezem"
    },
    {
        "naam": "Noodstop"
    }
]}

app.http('LeesVariabel', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'PLC/{id:int?}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            var id = request.params.id - 1;
            if (id < leesvariabelen.variabelen.length && id >= 0) {
                var methodParams = {
                    methodName: "leesVariabel",
                    payload: leesvariabelen.variabelen[id],
                    responseTimeoutInSeconds: 15
                }
                var result = await client.invokeDeviceMethod("PLC", methodParams);
                var value = result.result.payload
                return {
                    status: 200,
                    body: value
                }
            }
            else {
                return {
                    status: 404,
                    body: `Variabele met ID ${id+1} bestaat niet.`
                }
            }
        }
        catch (error) {
            context.log("Interne fout bij het lezen van een variabele.")
            return {
                satus: 500,
                body: 'Interne fout bij het lezen van een variabele.'
            }
        }
    }
});

//Body {'waarde': %WAARDE%}
app.http('SchrijfVariabel', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'PLC/{id:int?}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            var id = request.params.id - 1;
            if (id < schrijfvariabelen.variabelen.length && id >= 0) {
                var bod = await request.json();
                var methodParams = {
                    methodName: "schrijfVariabel",
                    payload: {"naam": schrijfvariabelen.variabelen[id].naam, "waarde": bod.waarde},
                    responseTimeoutInSeconds: 15
                }
                var result = await client.invokeDeviceMethod("PLC", methodParams);
                var value = result.result.payload
                return {
                    status: 200,
                    body: value
                }
            }
            else {
                return {
                    status: 404,
                    body: `Variabele met ID ${id+1} bestaat niet.`
                }
            }
        }
        catch (error) {
            context.log("Interne fout bij het lezen van een variabele.")
            return {
                satus: 500,
                body: 'Interne fout bij het lezen van een variabele.'
            }
        }
    }
});

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

app.http('PLCTest', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'kwik/',
    handler: async (request, context) => {
        context.log("TEST");
        try {
            var payload = await request.text();
            var req = JSON.parse(payload);
            return {
                status: 200,
                body: JSON.stringify(req)
            }
        }
        catch(e) {
            context.log('Interne fout bij TEST');
            return {
                satus: 500,
                body: 'TEST FOUT'
            }
        }
    }
});

/*
{"function":"zetGrondwaterpeil(int w)/zetReservoirwaterpeil(int w)", "waterpeil": int}
*/