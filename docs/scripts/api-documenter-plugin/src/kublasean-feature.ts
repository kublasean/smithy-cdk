
import {
    MarkdownDocumenterFeature,
    type IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
    type IMarkdownDocumenterFeatureOnFinishedArgs
} from '@microsoft/api-documenter';

export class KublaseanFeature extends MarkdownDocumenterFeature {

    public onInitialized(): void {
        console.log('KublaseanFeature: onInitialized()');
    }

    public onBeforeWritePage(eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs): void {

        // Remove .md from links
        eventArgs.pageContent = eventArgs.pageContent.replaceAll('.md', '');

        // Add the Jekyll header
        const header: string = [
            '---',
            `title: API`,
            '---',
            ''
        ].join('\n');
        eventArgs.pageContent = header + eventArgs.pageContent;
    }

    public onFinished(eventArgs: IMarkdownDocumenterFeatureOnFinishedArgs): void {
    
    }

}
