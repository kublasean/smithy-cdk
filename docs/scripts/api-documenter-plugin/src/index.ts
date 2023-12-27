
import type { IApiDocumenterPluginManifest } from '@microsoft/api-documenter';
import { KublaseanFeature } from './kublasean-feature';

export const apiDocumenterPluginManifest: IApiDocumenterPluginManifest = {
    manifestVersion: 1000,
    features: [
        {
            featureName: 'kublasean-api-documenter-plugin',
            kind: 'MarkdownDocumenterFeature',
            subclass: KublaseanFeature
        }
    ]
};
