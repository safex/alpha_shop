var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
const config = require('../config.json');


chai.use(chaiAsPromised);


const sfx_pay = require('../index');

describe('SafexPayments', function(){
    describe('#getPaymentStatusOne()', function(){
        it("Should return struct with paymentId and connected txs", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.getPaymentStatusOne("52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069");
            var expectedRes = {"paymentId":"52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069","txs":[{"amount":250000000000,"block_height":41104,"tx_hash":"3db35a20cdbc215af901087258a7f14d361731ace99d5f927e89fdf87b96c8a2","unlock_time":0},{"amount":500000000000,"block_height":41104,"tx_hash":"f387b9de42801795061113e072cc9be2c41af3f88141588b432c9473ab70617f","unlock_time":0}]};
            expect(JSON.stringify(res)).to.equal(JSON.stringify(expectedRes));
        });
    });

    describe('#getPaymentStatusBulk()', function(){
        it("Should return array of {paymentId:'', tx:[]} representing all txs connected with given paymentIds scanned from given start_block", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.getPaymentStatusBulk(['52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069','a1b2c3d4e5f61234'], 0);
            var expectedRes = [{"paymentId":"52cf9717af42a7002a40e9ed09c383248fce78da9c6652fc9f28a5ddac9c0069","txs":[{"amount":250000000000,"block_height":41104,"tx_hash":"3db35a20cdbc215af901087258a7f14d361731ace99d5f927e89fdf87b96c8a2","unlock_time":0},{"amount":500000000000,"block_height":41104,"tx_hash":"f387b9de42801795061113e072cc9be2c41af3f88141588b432c9473ab70617f","unlock_time":0}]},{"paymentId":"a1b2c3d4e5f61234","txs":[{"amount":1500000000000,"block_height":41108,"tx_hash":"0b2c5b715d5089b052789b53185721605bd2c336d6a2c011a120089b648b22b6","unlock_time":0}]}];
            expect(JSON.stringify(res)).to.equal(JSON.stringify(expectedRes));
        });
    });

    describe('#getIntegratedAddress()', function(){
        it("Should return integrated address for given paymentid", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.getIntegratedAddress("a1b2c3d4e5f61234");
            var expectedRes = {"integrated_address":"SFXti9o1apCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiRvnCtbfTutTn7eyZs"};
            expect(JSON.stringify(res)).to.equal(JSON.stringify(expectedRes));
        });
    });

    describe('#getInfo()', function(){
        it("Should return important information about running SafexD Node", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.getInfo();
            expect(res).to.have.property('height');
            expect(res).to.have.property('free_space');
            expect(res).to.have.property('mainnet');
            expect(res).to.have.property('stagenet');
            expect(res).to.have.property('testnet');
            expect(res).to.have.property('status');
            expect(res).to.have.property('start_time');
        });
    });

    describe('#getAddress()', function(){
        it("Should return payment address", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.getAddress();
            var expectedRes = {"payment_address":"SFXtzWd5wWCRhgUEU4FVJjBkNS9sarNpbexP6YfZgDYv3bcSVwCZtm9PWnpkoRiifC3uMQJS9ihFmNTbUXr2eWgY7LUMiPBHFgq"};
            expect(JSON.stringify(res)).to.equal(JSON.stringify(expectedRes));
        });
    });

    describe('#getHardForkInfo()', function(){
        it("Should return important information about hardfork.", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.getHardForkInfo();
            expect(res).to.have.property('enabled');
            expect(res).to.have.property('state');
            expect(res).to.have.property('status');
            expect(res).to.have.property('version');
        });
    });

    describe('#openWallet()', function(){
        it("Should return empty result", async () =>{
            let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);
            var res = await sfxPayment.openWallet("test.bin", "cicko");
            expect(JSON.stringify(res)).to.equal("{}");
        });
    });
});