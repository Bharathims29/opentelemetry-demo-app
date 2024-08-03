# opentelemetry-demo-app
Opentelemetry demo app to verify  the trace application to opentelemetry collecotor to Grafana tempo

This app is only purpose of to test the connectivity or test traces in opentelemetry sdk's used in apllication send a trace to opentelemetry collector then export to tempo in grafana and visualize the traces.

steps:

 cd backend/

 npm install

 node server.js

 cd ../frontend/

 npm install

 npm start
Port settings:

backend:

node runnning port : 3004

trace export to opentelemetry collector : 4317

trace export to opentelemetry collector protocol: gPRC

frontend:

node running port :3000 or 3001

Trace export to Backend to Frontend: 3004
