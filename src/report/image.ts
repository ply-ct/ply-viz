import * as fs from 'fs';
import { Reporter, ReportOptions, Runs } from '@ply-ct/ply';
import { ChartCallback, ChartJSNodeCanvas, ChartJSNodeCanvasOptions } from 'chartjs-node-canvas';
import 'chartjs-adapter-date-fns';
import { Dataset, TestRunData } from './chart/data';
import { ResultsChart } from './chart/chart';

export interface ImageReportOptions extends ReportOptions {
    report?: 'request-throughput' | 'response-times' | 'request-counts';
}

export class ImageReporter implements Reporter {
    async report(options: ImageReportOptions, data?: TestRunData) {
        const opts = { report: 'request-throughput', ...options };

        const runs = new Runs(opts.runsLocation);
        const plyResults = await runs.loadPlyResults();
        let testRunData = data;
        if (!testRunData) {
            testRunData = new TestRunData(plyResults, { intervals: 10 });
        }
        const chart = new ResultsChart(testRunData);

        const chartCallback: ChartCallback = (ChartJS) => {
            ChartJS.defaults.responsive = true;
            ChartJS.defaults.maintainAspectRatio = false;
        };

        const width = 1600;
        const height = 1000;
        const backgroundColour = '#ffffff';

        const canvasOptions: ChartJSNodeCanvasOptions = {
            width,
            height,
            backgroundColour,
            chartCallback,
            plugins: { modern: ['chartjs-adapter-date-fns'] }
        };

        let datasets: Dataset[] = [];
        if (opts.report === 'request-throughput') {
            datasets = testRunData.getRequestThroughput();
        } else if (opts.report === 'response-times') {
            datasets = testRunData.getResponseTimes();
        } else if (opts.report === 'request-counts') {
            datasets = testRunData.getResponseTimes();
        }

        const chartConfig = chart.getChartConfig(datasets);

        let buffer: Buffer;

        if (opts.format === 'svg' || opts.format === 'pdf') {
            const chartJSNodeCanvas = new ChartJSNodeCanvas({
                ...canvasOptions,
                type: opts.format
            });
            buffer = chartJSNodeCanvas.renderToBufferSync(
                chartConfig,
                opts.format === 'pdf' ? 'application/pdf' : 'image/svg+xml'
            );
        } else {
            const chartJSNodeCanvas = new ChartJSNodeCanvas(canvasOptions);
            buffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
        }

        console.log(`Writing file: ${opts.output}`);
        await fs.promises.writeFile(opts.output, buffer, 'base64');
    }
}
