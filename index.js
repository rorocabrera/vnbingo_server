const path = require("path");
const express = require("express");
const app = express();
const schedule = require("node-schedule");
const Cron = require("croner");
const port = process.env.PORT || 5050;
const mongoose = require("mongoose");
const UserDb = require('./public/models/userDb');
var bodyParser = require('body-parser');
const {createAddress} = require('./crypto');
const {verifyLinea, verifyBingo, genCarton} = require("./utils");
const { addUser, removeUser, isUser, getEmail, 
        printUsers, dameCartones, addCarton, updateJugada, clearCartones, 
         updateSocketid} = require("./usuarios");

//settings
app.set("port", port);

//static files
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//start the server
const server = app.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});


const fs = require('fs');    //importar a index

mongoose.connect(process.env.MONGO_URI, () => {
  console.log("conncted to db")});

fs.readFile('./serverstate.txt',function(err, estado){
    if (err) 
        throw err;   
    serverstate = estado == 'true';  

});

app.post('/regwallet', (req, res) => {
  console.log('se recibe peticion de registro de wallet');

  var wallet = createAddress();
  console.log(req.body);
  console.log(wallet)

  const userDb = new UserDb({
    uId: req.body.uid,
    wallet: wallet.key
  });

  userDb.save().then((result) =>{
  res.send({"wallet": wallet.wallet})}
  ).catch((err) => {
    console.log(err);
  });

});




const SocketIO = require("socket.io");
const io = SocketIO(server);
let jugada = {jugada: [], seCantol: false};
let ganadoresLinea = [];
let ganadoresBingo = [];
let state = false;
let varCron = "*/10 * * * *";
let nextRun = Cron(varCron).msToNext();
let bolAspeed = 6000;
let ganalinea = false;
let ganaBingo = false;
let nCartonesv = 0;

clock();





const job = Cron(varCron, () => {
  let flag = false;

  let i = 1;
  nextRun = job.msToNext();
  state = true;
  ganadoresLinea = [];
  ganadoresBingo = [];
  ganaBingo = false;
  io.emit("state", state);
  io.emit('cartones vendidos', nCartonesv);

  const intervalo = setInterval(() => {
    if (i == 75) {
    letsEnd();
    }
    nextRun = job.msToNext();

    if (!ganalinea && !flag && jugada.jugada.length < 75 && !ganaBingo) {
      emitirbola();
    } else if (ganalinea && !flag) {
      waitforwinners();
    } else if (!ganalinea && flag) {
      killsometime();
    }

    if (ganaBingo) {
      waitforwinnersBingo();
      
    }
  }, bolAspeed);

  async function killsometime() {
    await sleep(5000);
    flag = false;
  }

  async function letsEnd(){
    await sleep(5000);
    endsorteo();

  }

  async function waitforwinners() {
    flag = true;
    await sleep(3000);
    io.emit("cantaron linea", ganadoresLinea);
    
    ganalinea = false;
  }
  async function waitforwinnersBingo() {
    flag = true;
    ganaBingo = false;ro
    await sleep(3000);
    io.emit("cantaron bingo", ganadoresBingo);
    console.log("se emitio cantaron bingo" + JSON.stringify(ganadoresBingo));

    endsorteo();
  }

  async function endsorteo() {
    clearInterval(intervalo);
    serverstate = true;
    clearCartones();

    
    nCartonesv = 0;
    io.emit('cartones vendidos', nCartonesv);
    
    fs.writeFile('./serverstate.txt', 'true', function (err) {
        if (err) return console.log(err);
        });

    await sleep(5000);
    jugada = {jugada: [], seCantol: false};
    console.log("se acabo");
    clock();
    i = 0;
    io.emit("nextRun", nextRun);
    state = false;
    io.emit("state", state);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function emitirbola() {
    let isnewnumber;
    i++;
    let rnd = Math.floor(Math.random() * 75) + 1;
    isnewnumber = !jugada.jugada.includes(rnd);
    if (isnewnumber) {
      jugada.jugada.push(rnd);
      io.emit("bolita", rnd);
    }
    while (!isnewnumber) {
      rnd = Math.floor(Math.random() * 75) + 1;
      isnewnumber = !jugada.jugada.includes(rnd);
      if (isnewnumber) {
        jugada.jugada.push(rnd);
        io.emit("bolita", rnd);
      }
    }

    io.emit("state", state);
    return;
  }
});

function clock() {
  const Interval = setInterval(() => {
    nextRun = job.msToNext();
    if (nextRun == null) {
      nextRun = Cron(varCron).msToNext();
    }
    io.emit("nextRun", nextRun);
    if (nextRun < 1000) {
      clearInterval(Interval);
    }
  }, 1000);
}

io.on("connection", (socket) => {

  socket.emit("state", state);

  socket.on('linea', (datos) => { 
         
    if(verifyLinea(datos, jugada.jugada)){
    io.emit('stop linea', );
    let data = JSON.parse(datos);
    let email = getEmail(data.uid);
    ganadoresLinea.push(email);
    ganalinea = true;
    jugada.seCantol = true;

    }


 });

 socket.on('bingo', (datos) => { 
   console.log('alguien canto bingo');
     if(verifyBingo(datos, jugada.jugada)){
       console.log('se verifico el bingo');
    io.emit('stop bingo', );
    let data = JSON.parse(datos);
    let email = getEmail(data.uid);
    ganadoresBingo.push(email);
    console.log(datos);
    ganaBingo = true;
     }
 });

  console.log("se establecio conexion");

  socket.on("registrar", (data) => {
    let datos = JSON.parse(data);
    console.log('se recibe registar');
    socket.emit('cartones vendidos', nCartonesv);
   let cartones = [];
    let index = isUser(datos.uid);




    if(index != -1){        
        updateSocketid(index, socket.id);
        cartones = dameCartones(index);
    }
    else 
    addUser({sId: socket.id, uId: datos.uid, email: datos.email, carton: [], active: false});
  

    socket.emit('jugada', {jugada : jugada, cartones: cartones});
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);

    console.log(socket.id + "  has been disconected");
    socket.disconnect(true);
    printUsers(0);
  });

  socket.on("compra carton", (uid) => {
    console.log("se recibio compra carton");

    let carton = genCarton();
    addCarton(uid, carton);
  
  
      socket.emit("venta carton", carton);
   
    
    nCartonesv++;
    io.emit('cartones vendidos', nCartonesv);
  });

  socket.on('jugada', (data) => {

   
    let datos = JSON.parse(data);
    let index = isUser(datos.uid);
   if(index != -1){
    updateJugada(index, datos.value, datos.cartonIndex, datos.numeroIndex);
  }


});
});

