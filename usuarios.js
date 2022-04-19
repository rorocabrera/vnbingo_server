const users = [];
const fs = require('fs');



const util = require('util');
const { isSharedArrayBuffer } = require('util/types');
 
const addUser = ({sId, uId, email, carton, active}) => {
 
    let index = 0;

    
    while(index !== -1) {
     
    index = users.findIndex(function(user){
       return  user.uId == uId;
    });
   

    if(index !== -1)  {
        users.splice(index,1)[0];
    }
   

    }

    const user = {sId,uId, email, carton, active};
    users.push(user);
 
    
    printUsers(sId);
    return user;
    
 
}

const updateSocketid = (index, sId ) => {
    users[index].sId = sId;
    printUsers(0);
}

const addCarton = (uId, carton) =>{

    let index = isUser(uId);
    if (index != -1){
    users[index].active = true;
    users[index].carton.push(carton);
    }
    printUsers(0);
  
}

function isUser(uId){
    index = users.findIndex(function(user){
        return  user.uId == uId;
     });
     return index;
}

function makeWinnerLinea(index, ncarton){
    users[index].carton[ncarton].ganaL=true;
}


 
const removeUser = (sId) => {
    console.log('removing  ' + sId);


    const index = users.findIndex(function(user){
        return user.sId == sId;
    });


 
    if(index != -1) {
     
        if(Object.keys(users[index].carton).length == 0){        
            console.log('se borro', users[index].uId)
            users.splice(index,1)[0];}

        else { console.log('se salvo', users[index].uId);
                users[index].sId = '';
            
        }
  
     
        
    }

}

function dameCartones (index) {

    return users[index].carton;
}


function dameCarton (userIndex, cartonIndex) {

    return users[userIndex].carton[cartonIndex];
}

function updateJugada (index, value, cartonIndex, numeroIndex){

    users[index].carton[cartonIndex].Pressed[numeroIndex] = value;
    printUsers(0);

  
}

function getPressed (uid){
    return users[isUser(uid)].Pressed;
}

function getEmail (uid){
    return users[isUser(uid)].email;
}

function getActive (index){
    return users[index].active;
}

function socketsConected()
{
    return users.sId;
}



 
const getUser = (sId) => users
        .find((user) => user.sId === sId);
 
 const printUsers = (sId) =>{

    console.log(util.inspect(users, {showHidden: false, depth: null, colors: true}))
 }

function clearCartones () {
    users.forEach(function(e) {
        e.carton = [];
        e.active = false;
    })
 }


module.exports = {socketsConected, updateSocketid, addUser, getActive, removeUser, getEmail, makeWinnerLinea,
        getUser, printUsers, addCarton, isUser, dameCartones, updateJugada, clearCartones, getPressed, dameCarton};

