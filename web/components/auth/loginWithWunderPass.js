import { useState } from "react";

export default function LoginWithWunderPass(props) {
  const {dev, name, image, intent = [], onSuccess} = props;
  const [popup, setPopup] = useState(null);

  const handleClick = (e) => {
    e.preventDefault();
    const authPopup = popup || window.open(encodeURI(`https://app.wunderpass.org/oAuth?name=${name}&imageUrl=${image}&redirectUrl=${document.URL}`), 'WunderPassAuth', 'popup');
    setPopup(authPopup);
    
    const requestInterval = setInterval(() => {
      authPopup.postMessage({accountId: 'ABCDE', intent: intent}, 'https://app.wunderpass.org')
    }, 1000);
    
    window.addEventListener("message", (event) => {
      if (event.origin == 'https://app.wunderpass.org') {
        clearInterval(requestInterval);

        if (event.data?.wunderId) {
          onSuccess(event.data)
          event.source.window.close();
          setPopup(null)
        }
      }
    })
  }

  const goBack = (e) => {
    e.preventDefault();
    popup.focus();
  }

  const cancelAuth = (e) => {
    e.preventDefault();
    setPopup(null)
    popup.close();
  }

  return (
    <>
      <a href="https://app.wunderpass.org" onClick={handleClick}>
        <div style={{display: 'flex', alignItems: 'center', background: "#192858", borderRadius: 10, padding: "5px 10px"}}>
          <svg width="32" height="32" viewBox="0 0 42 40">
            <path d="M36.0991 34.2592C39.3239 30.5787 41.1373 25.8697 41.2156 20.9734C41.2939 16.0772 39.6319 11.3125 36.5264 7.53041L32.1979 11.0962C34.4589 13.8498 35.6689 17.3188 35.612 20.8836C35.555 24.4483 34.2346 27.8768 31.8868 30.5564L36.0991 34.2592Z" fill="#FFF"/>
            <path d="M4.76761 7.43866C1.64043 11.2027 -0.0489965 15.9577 0.00108219 20.8544C0.0511609 25.751 1.83748 30.4704 5.04099 34.1695L9.27455 30.4911C6.9422 27.7979 5.64165 24.3619 5.60519 20.7969C5.56872 17.2318 6.79873 13.7699 9.07552 11.0294L4.76761 7.43866Z" fill="#FFF"/>
            <path d="M33.8751 4.84521C30.1337 1.69312 25.3954 -0.0241054 20.5066 0.000255675C15.6178 0.0246168 10.8968 1.78898 7.18692 4.9782L10.8369 9.23802C13.538 6.91607 16.9751 5.6315 20.5345 5.61377C24.0938 5.59603 27.5436 6.84628 30.2676 9.1412L33.8751 4.84521Z" fill="#FFF"/>
            <path d="M33.8756 35.6067C30.1343 32.4547 25.396 30.7374 20.5072 30.7618C15.6184 30.7862 10.8974 32.5505 7.1875 35.7397L10.8375 39.9996C13.5385 37.6776 16.9757 36.393 20.5351 36.3753C24.0944 36.3576 27.5442 37.6078 30.2681 39.9027L33.8756 35.6067Z" fill="#1A98FB"/>
            <path d="M27.9795 28.7012C29.5893 27.2241 30.7198 25.2973 31.2247 23.1699C31.7295 21.0424 31.5856 18.8122 30.8116 16.7676C30.0375 14.7229 28.6689 12.9579 26.8826 11.7007C25.0964 10.4434 22.9747 9.75189 20.7918 9.71539C18.609 9.67889 16.4654 10.2991 14.6383 11.4959C12.8111 12.6927 11.3844 14.411 10.5427 16.4287C9.70089 18.4463 9.48277 20.6705 9.91648 22.8136C10.3502 24.9567 11.4158 26.9203 12.9755 28.4503L16.7193 24.6214C15.9245 23.8416 15.3815 22.841 15.1604 21.7489C14.9394 20.6567 15.0506 19.5233 15.4795 18.4951C15.9085 17.4669 16.6355 16.5913 17.5667 15.9814C18.4978 15.3715 19.5901 15.0554 20.7025 15.074C21.8149 15.0926 22.8961 15.445 23.8064 16.0857C24.7167 16.7264 25.4141 17.6259 25.8086 18.6678C26.2031 19.7098 26.2764 20.8463 26.0191 21.9304C25.7618 23.0146 25.1857 23.9965 24.3654 24.7492L27.9795 28.7012Z" fill="#1A98FB"/>
          </svg>
          <p style={{paddingLeft: 6, color: "#FFF"}}>Login With WunderPass</p>
        </div>
      </a>
      {popup &&
        <div style={{position: 'absolute', top: 0, left: 0, margin: 0, padding: 0, width: '100vw', height: '100vh', background: '#000C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <a href="#" onClick={goBack}>Go Back</a>
          <a href="#" onClick={cancelAuth}>Cancel</a>
        </div>
      }
    </>
  )
}