import * as fs from 'fs';
import * as path from 'path';
import { Reporter, ReportOptions, Runs } from '@ply-ct/ply';
import { ImageReporter, ImageReportOptions } from './image';

export class HtmlReporter implements Reporter {
    async report(options: ReportOptions) {
        // TODO template when run from vs-code
        const template = path.resolve(path.join(__dirname, '..', '..', 'templates', 'runs.html'));
        let html = await fs.promises.readFile(template, { encoding: 'utf-8' });

        const parentDir = path.dirname(options.output);
        const imgDir = path.join(parentDir, 'img');
        if (!fs.existsSync(imgDir)) await fs.promises.mkdir(imgDir);

        const imageReporter = new ImageReporter();
        await imageReporter.report({
            ...options,
            format: 'svg',
            output: `${imgDir}/request-throughput.svg`,
            report: 'request-throughput'
        });
        await imageReporter.report({
            ...options,
            format: 'svg',
            output: `${imgDir}/response-times.svg`,
            report: 'response-times'
        });
        await imageReporter.report({
            ...options,
            format: 'svg',
            output: `${imgDir}/request-counts.svg`,
            report: 'request-counts'
        });

        console.log(`Writing file: ${options.output}`);
        await fs.promises.writeFile(options.output, html, {
            encoding: 'utf-8'
        });
    }
}
