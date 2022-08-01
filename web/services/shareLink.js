export async function handleShare(url, text, handleSuccess) {
  const shareDetails = { url, text };
  console.log('url', url);
  if (navigator.share) {
    try {
      await navigator.share(shareDetails);
    } catch (error) {
      copyToClipboard(url)
        .then(() => handleSuccess('Copied URL to Clipboard'))
        .catch((err) => console.log(err));
    }
  } else {
    copyToClipboard(url)
      .then(() => handleSuccess('Copied URL to Clipboard'))
      .catch((err) => console.log(err));
  }
}

export default function copyToClipboard(text, setState = () => {}) {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setState(true);
        resolve(text);
      })
      .catch(reject);
  });
}
