const path = require('path');
const express =  require('express');
const app =  express();
const schedule = require('node-schedule');
const Cron = require("croner");
const port =  process.env.PORT || 5050;


//settings
app.set('port', port);

//static files
app.use(express.static(path.join(__dirname, 'public')));

//start the server
const server = app.listen(app.get('port'), () =>{
    console.log('server on port', app.get('port'))
});



const SocketIO =  require('socket.io');
const io = SocketIO(server);
let jugada = [];
let ganadoresLinea= [];
let ganadoresBingo= [];
let state = false;
let varCron = '*/10 * * * *';
let nextRun = Cron(varCron).msToNext();
let bolAspeed = 5000;
let ganalinea = false;
let ganaBingo= false;


clock();



const { addUser, removeUser, getUser, printUsers} = require("./usuarios");


const job = Cron(varCron,  () => {
    let flag = false;
    MyInterval = null;
    let i = 1;
    nextRun = job.msToNext();
    state = true;
    jugada = []; 
    ganadoresLinea= [];
    ganadoresBingo= [];
    ganaBingo=false;
    io.emit('state', state);
        
    const intervalo = setInterval(() => {

     
        if (jugada.length==75){
            endsorteo(); 
        }
        nextRun = job.msToNext();

        if(!ganalinea && !flag && jugada.length<75 ){

         
        emitirbola();}
        
        else if(ganalinea && !flag) {
            io.emit('cantaron linea', ganadoresLinea);
            console.log('se emitio cantaron linea' +  JSON.stringify(ganadoresLinea));
            flag = true;     
            ganalinea=false;       
        }

        else if (!ganalinea && flag){
            killsometime();                
            
        }

        if(ganaBingo){
            io.emit('cantaron bingo', ganadoresBingo);
            console.log('se emitio cantaron bingo' +  JSON.stringify(ganadoresBingo));
        }

      
      
                } , bolAspeed); 
                
    async function killsometime(){
        await sleep(3000);
        flag= false;
    }

    async function endsorteo(){
        clearInterval(intervalo);
        await sleep(5000);
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
let isnewnumber;
        i++;
        let rnd = Math.floor(Math.random() * 75) + 1;
        isnewnumber=!jugada.includes(rnd);
        if(isnewnumber){
            jugada.push(rnd);
            io.emit('bolita', rnd);
        }
        while (!isnewnumber) {
            rnd = Math.floor(Math.random() * 75) + 1;
            isnewnumber=!jugada.includes(rnd);
            if(isnewnumber){
                jugada.push(rnd);
                io.emit('bolita', rnd);
            }
        }
        
        io.emit('state', state);
        return
    }

} );


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
        ganadoresLinea.push(datos);
        console.log(datos);
        ganalinea = true;
     });

     socket.on('bingo', (datos) => { 
        ganadoresBingo.push(datos);
        console.log(datos);
        ganaBingo = true;
     });

        
    console.log('se establecio conexion');
    
    socket.on('registrar', (data) =>{   
        let datos = JSON.parse(data);
        console.log(datos);
        const usuario = addUser({sId: socket.id, uId: datos.uid, email: datos.email});
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
        console.log(socket.id + '  has been disconected');
        printUsers(0);
    })

    socket.on('compra carton', (uid) => {
        console.log('se recibio compra carton');

        let carton = genCarton();
        console.log(JSON.stringify(carton))
        socket.emit('venta carton', carton);
})
     
  
});

function genCarton(){
let Carton = {
    B: [], I: [], N: [], G: [], O: []
}
Carton.B = popColumns('B');      //popColumnsDev para pruebas popColumns para jugar
Carton.I = popColumns('I');
Carton.N = popColumns('N');
Carton.G = popColumns('G');
Carton.O = popColumns('O');

Carton.N[2] = 0;

console.log(Carton);
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

    for (let i = 0; i<5; i++){
        let rnd = Math.floor(Math.random() * (max - min)) + min;

            while (column.includes(rnd)) {
                rnd = Math.floor(Math.random() * (max - min)) + min;

            }
        column.push(rnd);
    }

    return column;
    



}












 



