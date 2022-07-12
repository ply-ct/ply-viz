import { HtmlReporter } from './report/html';
import { ImageReporter } from './report/image';

const imageReporter = new ImageReporter();
export const png = imageReporter;
export const svg = imageReporter;
export const pdf = imageReporter;

export const html = new HtmlReporter();
