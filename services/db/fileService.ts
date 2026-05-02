import * as FileSystem from 'expo-file-system/legacy';

export const downloadAndCacheFile = async (url: string, folder: string) => {
  const filename = url.split('/').pop();
  const localPath = FileSystem.documentDirectory + folder + filename;

  const fileInfo = await FileSystem.getInfoAsync(localPath);

  if (!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + folder,
      { intermediates: true }
    );

    await FileSystem.downloadAsync(url, localPath);
  }

  return localPath;
};