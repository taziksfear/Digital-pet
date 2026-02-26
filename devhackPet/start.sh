#!/bin/bash
echo "сборка"

cd frontend
npm i
npm run build

cd ../backend
go build -o pet_server main.go
echo "все"
./pet_server