```cpp
// Grondwaterbehoud
if (Grondwaterstand < Grondwaterpeil - 10) {
    PompReservoirtoGrond aan;
}
else {
    PompReservoirtoGrond uit;
}
if (Grondwaterstand > Grondwaterpeil + 10 AND ToestemmingBoezem) {
    KlepGrondtoBoezem aan
}
else {
    KlepGrondtoBoezem uit;
}

// Reservoirbehoud
if (Reservoirstand < Reservoirpeil - 10 AND ToestemmingBoezem) {
    KlepBoezemtoReservoir aan;
}
else {
    KlepBoezemtoReservoir uit;
}
if (Reservoirstand > Reservoirpeil + 10) {
    Pech;
}
```