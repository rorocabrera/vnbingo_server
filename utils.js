const { dameCarton, isUser, makeWinnerLinea } = require("./usuarios");

function genCarton() {
  let Carton = {
    B: [], I: [], N: [], G: [], O: [], Pressed: [],  ganaL: false, ganaB: false,     /*****Agrego HasBeenPressed */
}
  Carton.B = popColumns("B"); 
  Carton.I = popColumns("I");
  Carton.N = popColumns("N");
  Carton.G = popColumns("G");
  Carton.O = popColumns("O");

  Carton.N[2] = 0;

  for (let i = 0; i<25; i++){                /////////////////*******InitializoHasbeenPressed */
    Carton.Pressed.push(false);
    }
    Carton.Pressed[12] = true;
    Carton.N[2] = 0;

  return Carton;
}

function popColumns(letter) {
  let column = [];
  let min = 0;
  let max = 0;

  switch (letter) {
    case "B":
      min = 1;
      max = 16;
      break;
    case "I":
      min = 16;
      max = 31;
      break;
    case "N":
      min = 31;
      max = 46;
      break;
    case "G":
      min = 46;
      max = 61;
      break;
    case "O":
      min = 61;
      max = 76;
      break;
    default:
      return column;
  }

  for (let i = 0; i < 5; i++) {
    let rnd = Math.floor(Math.random() * (max - min)) + min;

    while (column.includes(rnd)) {
      rnd = Math.floor(Math.random() * (max - min)) + min;
    }
    column.push(rnd);
  }

  return column;
}





function verifyLineaCase(caso, carton, jugada){
  let j;
  let matrix = getMatrix(carton);

  for (let i = 0; i < 5; i++) {
    switch (caso) {
      case 1:
        j = i;
        break;
      case 2:
        j = i + 5;
        break;

      case 3:
        j = i + 10;
        break;

      case 4:
        j = i + 15;
        break;

      case 5:
        j = i + 20;
        break;

      case 6:
        j = (i * 5);
        break;

      case 7:
        j = (i * 5) + 1;
        break;

      case 8:
        j = (i * 5) + 2;
        break;

      case 9:
        j = (i * 5) + 3;
        break;

      case 10:
        j = (i * 5) + 4;
        break;

      case 11:
        j = (i * 6);
        break;

      case 12:
        j = (i * 4) + 4;
        break;

      default:
        return false;
    }
    if (j==12){ continue}
    else {
    if (carton.Pressed[j] && jugada.includes(matrix[j])) {
      if (i == 4) {
        return true;
      } else {
        continue;
      }
    } else {
      console.log('error');
      return false;
    }
  }
}


}



function verifyLinea(datos, jugada){
    let data =  JSON.parse(datos);
    let index = isUser(data.uid);
    let carton = dameCarton(index, data.ncarton);
    let caso = data.nlinea;
   
    if (verifyLineaCase(caso, carton, jugada)){
    makeWinnerLinea(index, data.ncarton);
    return true;
    }
    else return false;
}

function verifyBingo(datos, jugada){
  let data = JSON.parse(datos);
  let index = isUser(data.uid);
  let carton = dameCarton(index, data.ncarton);
  for(let i = 0 ; i<5; i++){
    if (!verifyLineaCase(i + 1,carton, jugada)){
      return false;
    }
  }
  return true;
}

function getMatrix(carton){
  let rows = [];

  for (let i = 0 ; i<5; i++){
    rows.push(carton.B[i]);
    rows.push(carton.I[i]);
    rows.push(carton.N[i]);
    rows.push(carton.G[i]);
    rows.push(carton.O[i]);
   
  }

  return rows;
}







module.exports = {verifyLinea, verifyBingo, genCarton};