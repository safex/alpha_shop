#!/bin/bash

# Sample script to create cert/key pair for SSL-TLS

# Creating key.pem cert.pem 
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365

# Client keys
openssl req -x509 -newkey rsa:2048 -keyout client-key.pem -out client-cert.pem -days 365