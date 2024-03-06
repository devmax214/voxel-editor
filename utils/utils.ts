export const cropToSquare = async (blob: Blob) => {
  return new Promise((resolve: (value: Blob) => void, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const size = Math.min(image.width, image.height);
      const startX = (image.width - size) / 2;
      const startY = (image.height - size) / 2;

      canvas.width = size;
      canvas.height = size;

      ctx?.drawImage(image, startX, startY, size, size, 0, 0, size, size);

      canvas.toBlob((croppedBlob) => {
        if (croppedBlob)
          resolve(croppedBlob);
        else
          reject('error');
      }, 'image/png');
      image.onerror = (e) => {
        reject(e);
      }
    };

    const url = URL.createObjectURL(blob);
    image.src = url;
  });
}