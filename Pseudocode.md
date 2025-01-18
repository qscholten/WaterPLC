```cpp
while (true) {
    // Grondwater te laag
    if (Grondwaterstand < Grondwaterpeil - VariatieGrondwaterpeil) {
        PompReservoirNaarGrond aan;
    }
    else {
        PompReservoirNaarGrond uit;
    }
    // Grondwater te hoog
    if (Grondwaterstand > Grondwaterpeil + VariatieGrondwaterpeil) {
        if (ToestemmingBoezem) {
            KlepGrondNaarBoezem aan;
        }
        else {
            PompGrondNaarReservoir aan;
        }
    }
    else {
        KlepGrondNaarBoezem uit;
        PompGrondNaarReservoir uit;
    }
    // Reservoir stand te laag
    if (Reservoirstand < Reservoirpeil - VariatieReservoir AND ToestemmingBoezem) {
        KlepBoezemNaarReservoir aan;
    }
    else {
        KlepBoezemNaarReservoir uit;
    }
    // Reservoir stand te hoog
    if (Reservoirstand > Reservoirpeil + VariatieReservoir) {
        Reservoirwaterstand waarschuwing;
    }
}

```