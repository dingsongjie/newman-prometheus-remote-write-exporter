# Push newman_api_passed metric to prometheus via remote_write

## Install:

```js
npm i -g newman-reporter-prometheus-remote-write
```

## Usage:

```js
newman run .\request_one_success.json -r prometheus-remote-write --reporter-prometheusUrl  http://prometheus-k8s.monitoring.svc.cluster.local:9090/api/v1/write


newman run .\request_one_success.json -r prometheus-remote-write --reporter-prometheusUrl  http://prometheus-k8s.monitoring.svc.cluster.local:9090/api/v1/write --reporter-username username  --reporter-password password
```
