const path = require('path');
const express =  require('express');
const app =  express();
const schedule = require('node-schedule');
const Cron = require("croner");



//settings
app.set('port', 5050);

//static files
app.use(express.static(path.join(__dirname, 'public')));

//start the server
const server = app.listen(app.get('port'), () =>{
    console.log('server on port', app.get('port'))
});

const SocketIO =  require('socket.io');
const io = SocketIO(server);



let ganadoresLinea= [];
let ganadoresBingo= [];
let state = false;
let varCron = '*/2 * * * *';
let nextRun = Cron(varCron).msToNext();
let bolAspeed = 2000;
let ganalinea = false;
let ganaBingo= false;
let serverstate;
let jugada = {jugada: [], seCantol: false};

/////////////////////////////////


const fs = require('fs');    //importar a index

fs.readFile('./serverstate.txt',function(err, estado){
    if (err) 
        throw err;   
    serverstate = estado == 'true';  

   
});





//////////////////////////////////////


clock();


const { addUser, removeUser, getActive, isUser, getEmail, printUsers, dameCartones, dameCarton, addCarton, updateJugada, clearCartones, getPressed} = require("./usuarios");
const {verifyLinea} = require("./utils");
/////////*********************************** */

const job = Cron(varCron,  () => {



    let flag = false;
    let i = 1;
   
  
   nextRun = job.msToNext();
    state = true;
    ganadoresLinea= [];
    ganadoresBingo= [];
    ganaBingo=false;
   
  
    io.emit('state', state);
        
    const intervalo = setInterval(() => {

        if (i==75){
            endsorteo(); 
        }
        nextRun = job.msToNext();

        if(!ganalinea && !flag && i<=75 && !ganaBingo ){

         
        emitirbola();}
        
        else if(ganalinea && !flag) {
           waitforwinners();    
        }

        else if (!ganalinea && flag){
            killsometime();                
            
        }

        if(ganaBingo){
            waitforwinnersBingo();
           
        }

      
      
                } , bolAspeed); 

            
                
    async function killsometime(){
        await sleep(5000);
        flag= false;
    }

    async function waitforwinners(){
        flag = true; 
        await sleep(3000);
        console.log(ganadoresLinea);
        io.emit('cantaron linea', ganadoresLinea);
                
            ganalinea=false;  

    }

    async function waitforwinnersBingo(){
        flag = true;   
        await sleep(3000);
        io.emit('cantaron bingo', ganadoresBingo);
             
            ganaBingo=false;  
            endsorteo(); 

    }

    async function endsorteo(){
        clearInterval(intervalo);
        clearCartones();

          serverstate = true;
          fs.writeFile('./serverstate.txt', 'true', function (err) {
              if (err) return console.log(err);
              });
  
             


        await sleep(5000);
        jugada = {jugada: [], seCantol: false};
        console.log('se acabo');
        clock();
        i=0;
        io.emit('nextRun', nextRun);
        state = false;
        io.emit('state', state);
        


      

       
    }     
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

 function emitirbola(){
     
        jugada.jugada.push(i);

        
        io.emit('bolita', i);
        io.emit('state', state);
        i++; 
       if (i==6)i=16;
       if (i==21) i=31;
       if(i==36) i=46
       if(i==51) i=61;
       if(i==65) i==75
        
        return
    }

} ); ///job ends


function clock() { 

    const Interval = setInterval(() => {
   
        nextRun = job.msToNext(); 
        if (nextRun==null){
            nextRun = Cron(varCron).msToNext();  
        }
        io.emit('nextRun', nextRun);
        if (nextRun<1000){
         
            clearInterval(Interval);
        }
                } , 1000); 
}





io.on('connection', (socket) => {

  
    

     io.emit('state', state);

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

     socket.on('bingo', (datos, jugada) => { 
         if(verifyBingo(datos, jugada.jugada)){
        io.emit('stop bingo', );
        let data = JSON.parse(datos);
        let email = getEmail(data.uid);
        ganadoresBingo.push(email);
        console.log(datos);
        ganaBingo = true;
         }
     });


        
    console.log('se establecio conexion');
    //console.log(io.sockets.sockets);


    socket.on('registrar', (data) =>{   
        let datos = JSON.parse(data);
        console.log('se recibio registrar');  
        let index = isUser(datos.uid);

        socket.emit('jugada', jugada);


        if(index != -1 && getActive(index)){        
                    ///*******************************************/////// */
            let cartones = dameCartones(index);
            cartones.forEach(function (e){
                console.log(e);
                socket.emit('venta carton', e);
            });


        }
        else addUser({sId: socket.id, uId: datos.uid, email: datos.email, carton: [], active: false});
        
        


    });

    socket.on('disconnect', (reason) => {

        removeUser(socket.id);
        console.log(socket.id + '  has been disconected');
        printUsers(0);
    })


    socket.on('compra carton', (uid) => {
        console.log('se recibio compra carton');

        let carton = genCarton();
        addCarton(uid, carton);
        socket.emit('venta carton', carton);
})

socket.on('jugada', (data) => {

    console.log('se recibio jugada');
    let datos = JSON.parse(data);
    let index = isUser(datos.uid);
    console.log(index + ' ' + datos.value + ' ' + datos.cartonIndex + ' ' + datos.numeroIndex);
    updateJugada(index, datos.value, datos.cartonIndex, datos.numeroIndex);


});
     
  
});

function genCarton(){
let Carton = {
    B: [], I: [], N: [], G: [], O: [], Pressed: [],  ganaL: false, ganaB: false,     /*****Agrego HasBeenPressed */
}
Carton.B = popColumns('B');      //popColumnsDev para pruebas popColumns para jugar
Carton.I = popColumns('I');
Carton.N = popColumns('N');
Carton.G = popColumns('G');
Carton.O = popColumns('O');

for (let i = 0; i<25; i++){                /////////////////*******InitializoHasbeenPressed */
Carton.Pressed.push(false);
}
Carton.Pressed[12] = true;
Carton.N[2] = 0;


return Carton;


}

function popColumns(letter){
    let column = [];
    let min = 0;
    let max = 0;
    switch(letter){
        case 'B': 
            min = 1;
            max = 16;
            break;
        case 'I': 
            min = 16;
            max = 31;
            break;
        case 'N': 
            min = 31;
            max = 46;
            break; 
        case 'G': 
            min = 46;
            max = 61;
            break;
        case 'O': 
            min = 61;
            max = 76;
            break;
        default:
            return column;
    }
    for (let i = min; i<min+5; i++){
      
        column.push(i);
    }

    return column;

}











 



