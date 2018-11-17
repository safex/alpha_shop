#!/bin/bash

# Sample script to create cert/key pair for SSL/TLS communication.

openssl genrsa 2048 > host.key
chmod 400 host.key
openssl req -new -x509 -nodes -sha2 -days 365 -key host.key -out host.cert
