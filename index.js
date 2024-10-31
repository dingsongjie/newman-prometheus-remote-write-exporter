const { pushMetrics } = require("prometheus-remote-write");
class PrometheusReporter {
    constructor(options) {
        console.log(options);
        this.metrics = [];
        this.remoteWriteConfig = {
            // Remote url
            url: options.prometheusUrl || 'http://your-prometheus-server/api/v1/write',
            // Auth settings
            auth: {
                username: options.username,
                password: options.password,
            },
            // Optional prometheus protocol descripton .proto/.json
            proto: undefined,
            // Override default console.name(...log) used
            console: undefined,
            // Be verbose
            verbose: false,
            timing: false,
            // Override used node-fetch
            fetch: undefined,
            // Additional labels to apply to each timeseries, i.e. [{ service: "SQS" }]
            labels: undefined,
            // Additional HTTP headers to send with each request
            headers: undefined
        };
    }
    // 在测试开始前执行的事件
    onStart() {
        console.log('Newman test run started');
    }

    // 在测试结束时执行的事件
    onDone(err, summary) {
        console.log('Newman test run done');
        // console.log(summary);
        summary.run.executions.forEach(execution => {
            // console.log(execution);
            let testid = execution.request && execution.request.headers && execution.request.headers.members
                ? execution.request.headers.members.find(v => v.key === 'testid')
                : null;
            let modules = execution.request && execution.request.headers && execution.request.headers.members
                ? execution.request.headers.members.find(v => v.key === 'modules')
                : null;
            if (!testid) {
                console.log('No testid found');
            }
            if (!modules) {
                console.log('No modules found');
            }
            let value = 0;
            if (execution.response && execution.response.code < 300 && execution.requestError == null && execution.assertions.find(assertion => assertion.error != null) == null) {
                value = 1;
            }

            this.metrics.push(
                {
                    name: 'newman_api_passed',
                    labels: {
                        testid: testid ? testid.value : null,
                        modules: modules ? modules.value : null
                    },
                    value: value
                }
            );
        });
        this.sendMetrics();
    }

    async sendMetrics() {
        await this.metrics.forEach(async element => {
            var config=Object.assign({}, this.remoteWriteConfig);
            config.labels = element.labels;
            await pushMetrics(
                {
                    newman_api_passed: element.value,
                },
                config
            );
        });

    }
}


function PrometheusRemoteWriteNewmanReporter(emitter, reporterOptions, collectionRunOptions) {
    const reporter = new PrometheusReporter(reporterOptions);
    emitter.on('start', () => reporter.onStart());
    emitter.on('done', (err, summary) => reporter.onDone(err, summary));
    // emitter.on('assertion', (err, data) => reporter.onAssertion(err, data));
}
module.exports = PrometheusRemoteWriteNewmanReporter