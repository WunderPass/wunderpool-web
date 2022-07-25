export async function handleShare(url, title, description, handleSuccess) {
  const shareDetails = { url, title, text: description };
  if (navigator.share) {
    try {
      await navigator.share(shareDetails);
    } catch (error) {
      copyToClipboard(url);
      handleSuccess('Copied URL to Clipboard');
    }
  } else {
    copyToClipboard(url);
    handleSuccess('Copied URL to Clipboard');
  }
}

export default function copyToClipboard(text, setState = () => {}) {
  try {
    navigator.clipboard.writeText(text);
    setState(true);
  } catch (error) {
    console.error(error);
  }
}
