import useUser from '/hooks/useUser'
import '../styles/globals.css'

function WunderPool({ Component, pageProps }) {
  const user = useUser();

  const appProps = Object.assign({
    user
  }, pageProps)

  return <Component {...appProps} />
}

export default WunderPool
