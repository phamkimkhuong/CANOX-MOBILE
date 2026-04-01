import {
    createUploadTask,
    FileSystemUploadType,
    getInfoAsync,
} from 'expo-file-system/legacy';

export type NativeFileUploadMethod = 'POST' | 'PUT' | 'PATCH';

export type NativeFileMetadata = {
    size: number;
    md5: string;
};

export type NativeFileUploadTarget = {
    url: string;
    fileUri: string;
    method: NativeFileUploadMethod;
    headers?: Record<string, string>;
};

export const getNativeFileMetadata = async (fileUri: string): Promise<NativeFileMetadata> => {
    const fileInfo = await getInfoAsync(fileUri, { md5: true });

    if (!fileInfo.exists || fileInfo.isDirectory) {
        throw new Error('Failed to access upload file');
    }

    if (typeof fileInfo.size !== 'number' || fileInfo.size <= 0) {
        throw new Error('Failed to determine file size');
    }

    if (!fileInfo.md5) {
        throw new Error('Failed to calculate file checksum');
    }

    return {
        size: fileInfo.size,
        md5: fileInfo.md5,
    };
};

export const uploadFileUriWithNativeTask = async (
    target: NativeFileUploadTarget,
    onProgress?: (progressFraction: number) => void
): Promise<void> => {
    const uploadTask = createUploadTask(
        target.url,
        target.fileUri,
        {
            headers: target.headers,
            httpMethod: target.method,
            uploadType: FileSystemUploadType.BINARY_CONTENT,
        },
        ({ totalBytesExpectedToSend, totalBytesSent }) => {
            if (totalBytesExpectedToSend <= 0) {
                return;
            }

            onProgress?.(Math.min(1, totalBytesSent / totalBytesExpectedToSend));
        }
    );

    const uploadResponse = await uploadTask.uploadAsync();
    if (!uploadResponse) {
        throw new Error('Cloud storage upload was interrupted');
    }

    if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        throw new Error(
            `Cloud storage upload failed: ${uploadResponse.status} - ${uploadResponse.body}`
        );
    }
};
