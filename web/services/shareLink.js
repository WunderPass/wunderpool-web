export async function handleShare(url, title, text, handleSuccess) {
  const shareDetails = { url, title, text };
  if (navigator.share) {
    try {
      if (navigator.canShare({ title }) && navigator.canShare({ text })) {
        await navigator.share(shareDetails);
      } else if (navigator.canShare({ title })) {
        await navigator.share({ url, title: `${title} || ${text}` });
      } else {
        await navigator.share({ url, text: `${title} || ${text}` });
      }
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
