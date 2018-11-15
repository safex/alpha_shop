#!/bin/bash

# Sample script to create cert/key pair for SSL/TLS communication.

openssl genrsa 1024 > host.key
chmod 400 host.key
openssl req -new -x509 -nodes -sha1 -days 365 -key host.key -out host.cert
