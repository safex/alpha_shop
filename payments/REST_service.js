var express = require("express");
var bodyParser = require('body-parser')
const colors = require('colors');
var router = express.Router()
var cookieParser = require('cookie-parser')
var errorHandler = require('errorhandler')

const https = require("https");
const fs = require("fs");
const helmet = require("helmet");

const config = require('config.json');

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
