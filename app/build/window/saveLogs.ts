import { ILogExporterEx } from "@lenovo-software/lsa-clients-common";
import { BrowserWindow, app, dialog } from "electron";
import { writeFile } from 'fs/promises';
import { i18n } from 'i18next';
import { i18next } from '../i18n/configs/i18next.config';
import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";
export class SaveLogs {
    private isOnDisplay = false;
    
    private constructor(
        private i18n: i18n,
        private logExporter: ILogExporterEx
    ) {

    }

    public static getInstance(logExporter: ILogExporterEx) {
        return new SaveLogs(i18next, logExporter);
    }

    // Returns true if save succeeded
    public async saveLog(browserWindow?: BrowserWindow): Promise<boolean> {
        if (this.isOnDisplay === true) {
            return false;
        }

        let ret = true;

        try {
            this.isOnDisplay = true;
            const defaultLogName = this.i18n.t('fileSaveDialog.saveAsType');
            var dialogSaveResult: Electron.SaveDialogReturnValue;
            if(typeof browserWindow !== 'undefined') {
                dialogSaveResult = await dialog.showSaveDialog(browserWindow, {
                    filters: [
                        { 
                            name: defaultLogName,
                            extensions: ['zip'] 
                        }
                    ],
                    defaultPath: 'lsa-client.zip'
                });

            }
            else {
                dialogSaveResult = await dialog.showSaveDialog( {
                    filters: [
                        { 
                            name: defaultLogName,
                            extensions: ['zip'] 
                        }
                    ],
                    defaultPath: 'lsa-client.zip'
                });
            }

            if (dialogSaveResult &&
                !dialogSaveResult.canceled &&
                dialogSaveResult.filePath &&
                dialogSaveResult.filePath.length > 0) {

                await this.writeZippedLog(dialogSaveResult.filePath);
            }
            else {
                ret = false;
            }
        }
        catch (err) {
            throw new Error('SaveLogs.saveLog(): Error: ' + err);
        }
        finally {
            this.isOnDisplay = false;
        }

        return ret;
    }

    public async writeZippedLog(path: string) {
        const platformName = process.platform === 'darwin' ? "Mac" : "Windows";
        const header = `== LanSchool Air for ${platformName} version ${app.getVersion()} ==\r\n`;
        let headers: Array<string> = new Array<string>;
        headers.push(header);
        const obfuscatedLog = await this.logExporter.retrieveObfuscatedLogBufferWithHeader(headers);

        const zipFileWriter = new BlobWriter();
        const zipWriter = new ZipWriter(zipFileWriter);
        const helloWorldReader = new TextReader(obfuscatedLog);
        await zipWriter.add("lsa-client.log", helloWorldReader);
        await zipWriter.close();
        const zipFileBlob = await zipFileWriter.getData();
        const buffer = Buffer.from(await zipFileBlob.arrayBuffer());
        await writeFile(path, buffer);
    }
}