import * as path from 'path';
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor';
import { execSync } from 'child_process';

function extractApi(): void {

    const apiExtractorJsonPath: string = path.join(__dirname, '../../package/api-extractor.json');

    // Load and parse the api-extractor.json file
    const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

    // Invoke API Extractor
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
        // Equivalent to the "--local" command-line parameter
        localBuild: true,

        // Equivalent to the "--verbose" command-line parameter
        showVerboseMessages: true
    });

    if (!extractorResult.succeeded) {
        throw new Error(`API Extractor completed with ${extractorResult.errorCount} errors` +` and ${extractorResult.warningCount} warnings`);
    }
}

function buildDocs(): void {
    execSync('npx --no-install api-documenter generate -o ../api');
}

//extractApi();

buildDocs();