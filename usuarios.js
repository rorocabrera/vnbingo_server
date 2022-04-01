const users = [];
const util = require('util');
 
const addUser = ({sId, uId, email}) => {
 
    let existingUser = 0;

    
    while(existingUser !== -1) {
        console.log(uId);
     
    existingUser = users.findIndex(function(user){
       return  user.uId == uId;
    });


    console.log('boto este indice  ' + existingUser);

    if(existingUser !== -1) {
        users.splice(existingUser,1)[0];
    }

    }

    const user = {sId,uId, email};
    users.push(user);
    printUsers(sId);
    return user;
    
 
}

const addCarton = (uId) =>{

    
}
 
const removeUser = (sId) => {
    console.log('removing  ' + sId);
    printUsers(0);

    const index = users.findIndex(function(user){
        return user.sId == sId;
    });


 
    if(index != -1) {
        console.log('Conditions Apply');
        users.splice(index,1)[0];
    }

}



 
const getUser = (sId) => users
        .find((user) => user.sId === sId);
 
 const printUsers = (sId) =>{

    console.log(util.inspect(users, {showHidden: false, depth: null, colors: true}))
 }


module.exports = {addUser, removeUser,
        getUser, printUsers};

