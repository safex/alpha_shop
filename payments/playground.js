const utils = require('./index');
const colors = require('colors');

console.log("Loading data".yellow);

let test_data = {"paymentId":"52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069","txs":[{"amount":250000000000,"block_height":41104,"tx_hash":"3db35a20cdbc215af901087258a7f14d361731ace99d5f927e89fdf87b96c8a2","unlock_time":0},{"amount":500000000000,"block_height":41104,"tx_hash":"f387b9de42801795061113e072cc9be2c41af3f88141588b432c9473ab70617f","unlock_time":0}]};
let test_data2 = [{"paymentId":"52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069","txs":[{"amount":250000000000,"block_height":41104,"tx_hash":"3db35a20cdbc215af901087258a7f14d361731ace99d5f927e89fdf87b96c8a2","unlock_time":0},{"amount":500000000000,"block_height":41104,"tx_hash":"f387b9de42801795061113e072cc9be2c41af3f88141588b432c9473ab70617f","unlock_time":0}]},{"paymentId":"a1b2c3d4e5f61234","txs":[{"amount":1500000000000,"block_height":41108,"tx_hash":"0b2c5b715d5089b052789b53185721605bd2c336d6a2c011a120089b648b22b6","unlock_time":0}]}];

const safex = require('safex-nodejs-libwallet');
const path = require('path');
const minute = 60000;
var wallet;
var sent = false;

var args = {
    'path': './baaaa.bin',
    'password': '',
    'network': 'testnet',
    'daemonAddress': 'localhost:29393',
    'restoreHeight': 0,
    'mnemonic': 'deftly large tirade gumball android leech sidekick opened iguana voice gels focus poaching itches network espionage much jailed vaults winter oatmeal eleven science siren winter'
};

var p1 = "a1b2c4d4e5e61235";
var p2 = "a1b2c5d4e5e61236";
var p3 = "a1b2c6d4e5e61237";

console.log("Listening for payments.".yellow);

let payments = new utils.Payments();
payments.listenForPayments();
setTimeout(payments.clearLedger.bind(payments), 500);

console.log(JSON.stringify([...(payments.ledger)]));