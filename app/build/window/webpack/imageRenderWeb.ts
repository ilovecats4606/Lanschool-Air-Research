import { LogSeverity } from '../../logSeverity';
import { ImageProcessor, IImageProcessorLogger } from '@lenovo-software/lsa-clients-dom-renderer';
import { ICurrentScreenRenderParameter, RenderedImageReturn } from '../../renderedImageReturn';
import { LogMessageFromUI } from '../mainWindow';
import { ipcRenderer } from 'electron';

class ImageProcessorLogger implements IImageProcessorLogger {
	protected sendLog(param: LogMessageFromUI) {
		ipcRenderer.send('onLogMessage', param);
	}

	public logDebug(msg: string) {
		this.sendLog({
			severity: LogSeverity.DEBUG, 
			msg: msg
		});
	}
	
	public logInfo(msg: string) {
		this.sendLog({
			severity: LogSeverity.INFO, 
			msg: msg
		});
	}
	
	public logMessage(msg: string) {
		this.sendLog({
			severity: LogSeverity.INFO, 
			msg: msg
		});
	}

	public logWarning(msg: string) {
		this.sendLog({
			severity: LogSeverity.WARNING, 
			msg: msg
		});
	}

	public logError(msg: string) {
		this.sendLog({
			severity: LogSeverity.ERROR, 
			msg: msg
		});
	}

}

export class RenderScreenRequestHandler {
    protected imageProcessor: ImageProcessor;
	protected imageProcessorLogger: ImageProcessorLogger;

    constructor() {
        this.imageProcessorLogger = new ImageProcessorLogger;
		this.imageProcessor = new ImageProcessor(this.imageProcessorLogger);
    
        ipcRenderer.on('renderCurrentScreen', (event, arg: ICurrentScreenRenderParameter) => {
            //console.log('RenderScreenRequestHandler - renderCurrentScreen handler(+)');
            if (!arg ||
                !arg.dataURI ||
                arg.dataURI.length < 1 ||
                !arg.messageId ||
                arg.messageId.length < 1) {
                throw new Error('RenderScreenRequestHandler - renderCurrentScreen handler(): Parameter(s) missing.');
            }

            this.imageProcessorLogger.logInfo('RenderScreenRequestHandler - renderCurrentScreen: converting to image bitmap...');
            this.imageProcessor.toImageBitmap(arg.dataURI)
            .then((imageBitmap: ImageBitmap) => {
                this.imageProcessorLogger.logInfo('RenderScreenRequestHandler - renderCurrentScreen: processing image...');
                this.imageProcessor.processImage(imageBitmap, arg.imageParams)
                .then((processedImage: string) => {
                    ipcRenderer.send('onRenderCurrentScreenCompleted', RenderedImageReturn.fromAny({
                        messageId: arg.messageId,
                        processedImage: processedImage,
                        width: imageBitmap.width,
                        height: imageBitmap.height
                    }));
                })
                .catch((e) => {
                    this.imageProcessorLogger.logError('RenderScreenRequestHandler - renderCurrentScreen: Error processing image: ' + e);
                    ipcRenderer.send('onRenderCurrentScreenError', RenderedImageReturn.fromAny({
                        messageId: arg.messageId,
                        error: e
                    }));	
                })
                .finally(() => {
                    imageBitmap.close();
                });
            })
            .catch((e: any) => {
                this.imageProcessorLogger.logError('RenderScreenRequestHandler - renderCurrentScreen: Error converting image bitmap: ' + e);
                ipcRenderer.send('onRenderCurrentScreenError', RenderedImageReturn.fromAny({
                    messageId: arg.messageId,
                    error: e
                }));
            });
        });
    }
}
