let TITANIC_DATASET;
let lista = [];
let lista_classe = [];
let lista_sesso = [];
let lista_eta = [];
let lista_sop = [];

function preload() {
    TITANIC_DATASET = loadTable("titanic_dataset.csv", "csv", "header");
}

function setup() {
    console.log("Totale passeggeri:", TITANIC_DATASET.getRowCount());

    for (let _n = 0; _n < TITANIC_DATASET.getRowCount(); _n++) {
        lista.push(TITANIC_DATASET.getRow(_n).arr);

        lista_sop.push(parseInt(TITANIC_DATASET.getRow(_n).arr[0]));

        lista_eta.push(parseInt(TITANIC_DATASET.getRow(_n).arr[4]));

        lista_classe.push(parseInt(TITANIC_DATASET.getRow(_n).arr[1]));

        if (TITANIC_DATASET.getRow(_n).arr[3] == "male") {
            lista_sesso.push(1);
        } else {
            lista_sesso.push(0);
        }
    }
}

function TEST_DATABASE(eta_inizio = 0, eta_fine = 80, sesso_M = true, sesso_F = true, classe_inizio = 1, classe_fine = 3) {
    let tot_sop = 0;
    let tot_contati = 0;
    let sop_titanic = TITANIC_DATASET.getColumn("sop");
    let eta_titanic = TITANIC_DATASET.getColumn("eta");
    let sesso_titanic = TITANIC_DATASET.getColumn("sesso");
    let classe_titanic = TITANIC_DATASET.getColumn("classe");

    //////////////////
    if (document.getElementById("number_D1").value == "") {
        eta_inizio = 0;
    } else {
        eta_inizio = parseInt(document.getElementById("number_D1").value);
    }
    if (document.getElementById("number_D2").value == "") {
        eta_fine = 80;
    } else {
        eta_fine = parseInt(document.getElementById("number_D2").value);
    }

    let classe_1_D = document.getElementById("classe_1_D").checked;
    let classe_2_D = document.getElementById("classe_2_D").checked;
    let classe_3_D = document.getElementById("classe_3_D").checked;
    let classe_ALL_D = document.getElementById("classe_ALL_D").checked;
    if (classe_1_D) {
        classe_inizio = 1;
        classe_fine = 1;
    }
    if (classe_2_D) {
        classe_inizio = 2;
        classe_fine = 2;
    }
    if (classe_3_D) {
        classe_inizio = 3;
        classe_fine = 3;
    }
    if (classe_ALL_D) {
        classe_inizio = 1;
        classe_fine = 3;
    }

    let sesso_1_D = document.getElementById("sesso_1_D").checked;
    let sesso_2_D = document.getElementById("sesso_2_D").checked;
    let sesso_ALL_D = document.getElementById("sesso_ALL_D").checked;
    if (sesso_1_D) {
        sesso_M = true;
        sesso_F = false;
    }
    if (sesso_2_D) {
        sesso_M = false;
        sesso_F = true;
    }
    if (sesso_ALL_D) {
        sesso_M = true;
        sesso_F = true;
    }

    /////////////////

    let array_contati = [];
    let array_sop = [];
    let array_no_sop = [];
    for (let _n in sop_titanic) {
        if (eta_titanic[_n] >= eta_inizio && eta_titanic[_n] <= eta_fine && ((sesso_titanic[_n] == "male") == sesso_M || (sesso_titanic[_n] == "female") == sesso_F) && classe_titanic[_n] >= classe_inizio && classe_titanic[_n] <= classe_fine) {
            tot_contati += 1;
            //array_contati.push(TITANIC_DATASET.getRow(_n).obj)
            if (sop_titanic[_n] > 0) {
                tot_sop += 1;
                //array_sop.push(TITANIC_DATASET.getRow(_n).obj)
            } else {
                //array_no_sop.push(TITANIC_DATASET.getRow(_n).obj)
            }
        }
    }
    document.getElementById("risultato_1D").innerHTML = tot_contati + " su 1309 - (" + roundTo((100 / eta_titanic.length * tot_contati), 2) + "% del totale passeggeri)";
    document.getElementById("risultato_2D").innerHTML = tot_sop + " su " + tot_contati + " - (" + roundTo((100 / tot_contati * tot_sop), 2) + "% del campione ricercato)";
    let floor_sop = 100 / tot_contati * tot_sop;
    let r = floor(map(floor_sop, 0, 100, 255, 0));
    let g = floor(map(floor_sop, 0, 100, 0, 255));
    let rgba = "rgba(" + r + "," + g + ",0,0.801)";
    $("#scheda_2_RD").css("background-color", rgba);
    return
}

function sortFunction(a, b) {
    if (parseInt(a[4]) === parseInt(b[4])) {
        return 0;
    }
    else {
        return (parseInt(a[4]) < parseInt(b[4])) ? -1 : 1;
    }
}

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
let start = 198.72231292079036;
let W1 = -2.1738142832752856;
let W2 = -2.605106141393292;
let W3 = -1.1635047610062328;
let B = 2.6418324183586774;
const X1 = lista_classe;
const X2 = lista_sesso;
const X3 = lista_eta;
const Y = lista_sop;
const rate_apprendimento = 0.0001;
let TOT_cicli = 100000;

function NET(_x1, _x2, _x3, _W1 = W1, _W2 = W2, _W3 = W3, _B = B) {
    return sigmoid(_W1 * _x1 + _W2 * _x2 + _W3 * _x3 + _B);
}

function delta(_loss, _slope, _derivata, _peso, _info) {
    if (_loss == 0) {
        return _peso;
    } else {
        return _peso - (rate_apprendimento * (_slope * _derivata * _info));
    }
}

function NN() {

    for (let _x1 = 0; _x1 < 10000; _x1++) {
        for (let _x = 0; _x < TOT_cicli; _x++) {
            let pos = Math.floor(Math.random() * lista_sop.length);
            let map_classe = map(X1[pos], 1, 3, 0, 1);
            let map_eta = map(X3[pos], 0, 80, 0, 1);

            let r_net = NET(map_classe, X2[pos], map_eta);
            let loss1 = loss(Y[pos], r_net);
            let slope1 = slope(Y[pos], r_net);
            let derivata1 = derivata(r_net);

            W1 = delta(loss1, slope1, derivata1, W1, map_classe);
            W2 = delta(loss1, slope1, derivata1, W2, X2[pos]);
            W3 = delta(loss1, slope1, derivata1, W3, map_eta);
            B = delta(loss1, slope1, derivata1, B, 1);
        }
        if (totale_perdita() < start) {
            console.log("Accuratezza:", totale_perdita());
            console.log("Accuratezza singola:", totale_perdita() / lista_sop.length);
            console.log("CAMBIO:", totale_perdita() - start)
            console.log("///////////////////");
            console.log("let start = " + (totale_perdita() / lista_sop.length) + ";\n" + "let W1 = " + W1 + ";\n" + "let W2 = " + W2 + ";\n" + "let W3 = " + W3 + ";\n" + "let B = " + B + ";");
            start = (totale_perdita() / lista_sop.length);
            break;
        } else {
            console.log("CAMBIO:", totale_perdita() - start);
        }
    }
}

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
function sigmoid(num) {
    return 1 / (1 + Math.exp(-num));
}

function sigmoidPrime(z) {
    return Math.exp(-z) / Math.pow(1 + Math.exp(-z), 2);
}

function derivata(_x) {
    return sigmoid(_x) * (1 - sigmoid(_x))
}

function roundTo(value, decimalpositions) {
    var i = value * Math.pow(10, decimalpositions);
    i = Math.round(i);
    return i / Math.pow(10, decimalpositions);
}

function RELU(x) {
    if (x > 0) {
        return x
    }
    else {
        return 0
    }
}

function loss(out_desiderato, out_nodo) {
    return ((out_nodo - out_desiderato) ** 2);
}

function slope(out_desiderato, out_nodo) {
    return 2 * (out_nodo - out_desiderato);
}

function accuratezza(out_desiderato, out_nodo) {
    let res = (out_desiderato - out_nodo) ** 2;
    return Math.sqrt(res)
}

function totale_perdita() {
    let totale_perdita = 0;
    for (let _pos in lista_sop) {
        let map_classe = map(X1[_pos], 1, 3, 0, 1);
        let map_eta = map(X3[_pos], 0, 80, 0, 1);
        let r_net = NET(map_classe, X2[_pos], map_eta);
        let perdita = loss(Y[_pos], r_net);
        totale_perdita += perdita;
    }
    return totale_perdita;
}

function TEST_LEONARDO(_classe, _sesso, _eta) {
    let classe_1 = document.getElementById("classe_1").checked;
    let classe_2 = document.getElementById("classe_2").checked;
    let classe_3 = document.getElementById("classe_3").checked;
    if (classe_1) {
        _classe = 1;
    }
    if (classe_2) {
        _classe = 2;
    }
    if (classe_3) {
        _classe = 3;
    }

    let sesso_1 = document.getElementById("sesso_1").checked;
    let sesso_2 = document.getElementById("sesso_2").checked;
    if (sesso_1) {
        _sesso = 1;
    }
    if (sesso_2) {
        _sesso = 0;
    }
    if (document.getElementById("number").value == "") {
        _eta = 40;
    } else {
        _eta = parseInt(document.getElementById("number").value);
    }

    let eta_T = map(_eta, 0, 80, 0, 1);
    let classe_T = map(_classe, 1, 3, 0, 1);
    let r_net = NET(classe_T, _sesso, eta_T);
    let num_f = floor(r_net * 100);
    console.log(r_net);
    let r = floor(map(num_f, 0, 100, 255, 0));
    let g = floor(map(num_f, 0, 100, 0, 255));
    let rgba = "rgba(" + r + "," + g + ",0,0.801)";
    $("#scheda_2_R").css("background-color", rgba);
    return document.getElementById("risultato").innerHTML = num_f + "%";
}