export const isImage = (url: string, signal: AbortSignal) => {
  return fetch(url, { signal })
    .then((res) => {
      if (!res.ok) {
        throw new Error('HTTP error ' + res.status);
      }
      return res.blob();
    })
    .then((blob) => {
      return blob.type.startsWith('image/');
    })
    .catch(() => {
      return false;
    });
};
