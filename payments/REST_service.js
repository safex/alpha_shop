// Copyright (c) 2018, The Safex Project
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var express = require("express");
var bodyParser = require('body-parser')
const colors = require('colors');
var router = express.Router()
var cookieParser = require('cookie-parser')
var errorHandler = require('errorhandler')

const https = require("https");
const fs = require("fs");
const helmet = require("helmet");

const config = require('./config');

const options = {
    key: fs.readFileSync("./certs/host1.key"),
    cert: fs.readFileSync("./certs/host1.cert")
};

const sfx_pay = require('./index');

let sfxPayment = new sfx_pay.SafexPayments(config.walletRPCPort, config.nodeRPCPort);

var app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(errorHandler());

const port = 3000;

let form_rest_response = function(result) {
  return {
      error: false,
      result: result,
      timestamp: new Date()
  };
};

let form_rest_error = function(err) {
    console.log(JSON.stringify(err));
  return {
      error:  true,
      error_msg: err,
      timestamp: new Date()
  }
};

app.post("/getpaymentinfo", function(req,res,next){
    if(req.body.paymentId) {
        sfxPayment.getPaymentStatusOne(req.body.paymentId).then((result) => {
            res.json(form_rest_response(result));
        }).catch((e) => {
           res.json(form_rest_error(e));
        });
    }
    else {
        res.json({
            error : true,
            error_msg: 'Invalid request!',
            timestamp: new Date()
        })
    }
});

app.post("/getpaymentsinfo", function(req,res,next){
    if(req.body.paymentIds  && req.body.startBlockHeight) {
        sfxPayment.getPaymentStatusBulk(req.body.paymentIds, req.body.startBlockHeight).then((result) => {
            res.json(form_rest_response(result));
        }).catch((e) => {
            res.json(form_rest_error(e));
        });
    }
    else {
        res.json({
            error : true,
            error_msg: 'Invalid request!',
            timestamp: new Date()
        })
    }
});

app.post("/getintegratedaddress", function(req,res,next){
    if(req.body.paymentId) {
        sfxPayment.getIntegratedAddress(req.body.paymentId).then((result) => {
            res.json(form_rest_response({ integrated_address: result}));
        }).catch((e) => {
            res.json(form_rest_error(e));
        });
    }
    else {
        res.json({
            error : true,
            error_msg: 'Invalid request!',
            timestamp: new Date()
        })
    }
});

app.post("/getpaymentaddress", function(req, res, next){

    sfxPayment.getAddress().then((result) => {
        res.json(form_rest_response(result));
    }).catch((e) => {
        res.json(form_rest_error(e));
    });

});

app.post("/hardforkinfo", function(req, res, next){
    sfxPayment.getHardForkInfo().then((result) => {
        res.json(form_rest_response({ integrated_address: result}));
    }).catch((e) => {
        res.json(form_rest_error(e));
    });
});

app.post("/nodeinfo", function(req, res, next){
    sfxPayment.getInfo().then((result) => {
        res.json(form_rest_response({ integrated_address: result}));
    }).catch((e) => {
        res.json(form_rest_error(e));
    });
});

app.post("/openwallet", function(req, res, next){
    if(req.body.filename && req.body.password) {
        sfxPayment.openWallet(req.body.filename, req.body.password).then((result) => {
            res.json(form_rest_response(result));
        }).catch((e) => {
            res.json(form_rest_error(e));
        });
    }
    else {
        res.json({
            error : true,
            error_msg: 'Invalid request!',
            timestamp: new Date()
        })
    }
});

app.use(function(req, res){
    res.status(404);
    res.json({ error: true, error_msg : 'Not found', timestamp: new Date() });
});

https.createServer(options, app).listen(port+1);
