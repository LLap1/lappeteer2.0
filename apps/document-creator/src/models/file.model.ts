export async function zipFiles(files: File[]): Promise<File> {
  const entries: Record<string, File> = {};
  
  for (const file of files) {
    entries[file.name] = file;
  }

  const zipBuffer = await Bun.zip(entries).arrayBuffer();
  const zipBlob = new Blob([zipBuffer], { type: 'application/zip' });
  
  return new File([zipBlob], 'documents.zip', { type: 'application/zip' });
}

