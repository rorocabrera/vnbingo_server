const KEY = process.env.KEY;
var apiUrl = 'https://data-seed-prebsc-1-s2.binance.org:8545/';
// var Accounts = require('web3-eth-accounts');
const Web3 = require('web3');
const web3 = new Web3(apiUrl);
var CryptoJS = require("crypto-js");

function createAddress() {
    var account = web3.eth.accounts.create();
    var ciphertext = CryptoJS.AES.encrypt(account.privateKey, process.env.KEY).toString();
    console.log("not encrypted:  " + account.privateKey);
    console.log("encrypted: " + ciphertext)
    var data = {"key":ciphertext, "wallet": account.address};
    return data;
}






module.exports = {createAddress};