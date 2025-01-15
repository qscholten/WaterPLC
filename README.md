# WaterPLC

## Variabelen lezen
Variabelen van de PLC kunnen gelezen worden via de link https://waterplc.azurewebsites.net/api/plc/{id:int} met een GET request. Hierbij is {id:int} het ID van de uit te lezen variabele. In de volgende tabel staat beschreven welke ID bij welke variabele hoort. 
| ID | Variabele |
| -- | -- |
| 1. | Grondwaterpeil |
| 2. | Reservoirpeil |
| 3. | Grondwaterstand | 
| 4. | Reservoirstand |
| 5. | Noodstop |

Het antwoord wat teruggegeven wordt door de PLC is een integer. Deze integer representeert de waarde van de opgevraagde variabele. 

## Variabelen schrijven
Variabelen van de PLC kunnen geschreven worden via de link https://waterplc.azurewebsites.net/api/plc/{id:int} met een PUT request. Hierbij is {id:int} het ID van de te schrijven variabele. De meegegeven body met deze request is in JSON: {"waarde": %WAARDE%}. Hierbij is %WAARDE% de waarde die geschreven moet worden naar de variabele. In de volgende tabel staat beschreven welke ID bij welke variabele hoort. 
| ID | Variabele | 
| -- | -- |
| 1. | Grondwaterpeil |
| 2. | Reservoirpeil |
| 3. | ToestemmingBoezem | 
| 4. | Noodstop |