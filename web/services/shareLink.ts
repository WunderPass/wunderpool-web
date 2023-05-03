export async function handleShare(
  url: string,
  text: string,
  onSuccess = (msg: string) => {}
) {
  const shareDetails = { url, text };
  if (navigator.share) {
    try {
      await navigator.share(shareDetails);
    } catch (error) {
      copyToClipboard(url)
        .then(() => onSuccess('Copied URL to Clipboard'))
        .catch((err) => console.log(err));
    }
  } else {
    copyToClipboard(url)
      .then(() => onSuccess('Copied URL to Clipboard'))
      .catch((err) => console.log(err));
  }
}

export default function copyToClipboard(text: string, onSuccess = () => {}) {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        onSuccess();
        resolve(text);
      })
      .catch(reject);
  });
}
