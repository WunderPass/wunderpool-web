import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html translate="no">
        <Head />
        <Main />
        <NextScript />
      </Html>
    );
  }
}
