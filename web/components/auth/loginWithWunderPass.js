import { useState } from 'react';

export default function LoginWithWunderPass(props) {
  const { dev, name, image, intent = [], onSuccess } = props;
  const [popup, setPopup] = useState(null);

  const handleClick = (e) => {
    e.preventDefault();
    const authPopup =
      popup ||
      window.open(
        encodeURI(
          `${process.env.WUNDERPASS_URL}/oAuth?name=${name}&imageUrl=${image}&redirectUrl=${document.URL}`
        ),
        'WunderPassAuth',
        'popup'
      );
    setPopup(authPopup);

    const requestInterval = setInterval(() => {
      authPopup.postMessage(
        { accountId: 'ABCDE', intent: intent },
        process.env.WUNDERPASS_URL
      );
    }, 1000);

    window.addEventListener('message', (event) => {
      if (event.origin == process.env.WUNDERPASS_URL) {
        clearInterval(requestInterval);

        if (event.data?.wunderId) {
          onSuccess(event.data);
          event.source.window.close();
          setPopup(null);
        }
      }
    });

    const closedListener = setInterval(() => {
      if (authPopup.closed) {
        setPopup(null);
        clearInterval(closedListener);
      }
    }, 500);
  };

  const goBack = (e) => {
    e.preventDefault();
    popup.focus();
  };

  const cancelAuth = (e) => {
    e.preventDefault();
    setPopup(null);
    popup.close();
  };

  return (
    <>
      <a href={process.env.WUNDERPASS_URL} onClick={handleClick}>
        <div className="flex text-center items-center justify-center bg-kaico-blue hover:bg-kaico-dark-blue rounded-md lg:px-2 py-2 font-bold text-md">
          <svg
            className="fill-white"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            version="1"
            viewBox="0 0 2000 1917"
          >
            <path
              d="M9670 19164c-223-10-473-26-615-40-1833-170-3567-835-5030-1929-192-143-508-397-534-429-13-16 64-96 864-896 764-764 882-878 896-867 9 6 79 60 155 120 1103 855 2419 1379 3824 1522 523 53 1169 45 1710-20 1147-138 2267-556 3240-1209 138-93 432-308 545-401l31-24 882 882 882 882-151 125c-1281 1059-2776 1771-4399 2094-443 88-870 144-1355 176-156 10-813 20-945 14zM2304 15563c-182-212-437-555-633-848-919-1379-1478-2965-1630-4630-92-999-31-2039 175-3005 340-1593 1044-3052 2072-4293 62-75 117-137 120-137 4 0 402 395 886 879l878 878-94 119c-435 546-820 1218-1085 1892-219 558-374 1167-452 1772-45 354-55 528-56 965 0 528 23 827 101 1284 200 1185 683 2300 1409 3257l123 161-882 882-883 883-49-59zM16760 14735l-882-882 104-134c554-721 991-1588 1243-2468 379-1325 388-2754 25-4081-261-954-725-1872-1340-2650l-91-114 881-881 881-880 44 48c75 82 276 334 420 527 970 1304 1615 2863 1849 4470 69 473 96 825 103 1335 7 527-13 915-73 1395-213 1709-866 3335-1889 4705-114 153-302 391-360 456l-33 36-882-882zM9755 14459c-1539-69-2938-790-3909-2014-368-464-681-1054-865-1630-337-1053-334-2212 8-3252 86-262 159-442 281-688 250-506 547-927 953-1350l115-120 858 857 858 857-121 124c-413 428-668 958-759 1582-25 170-25 582-1 750 125 840 559 1535 1242 1990 359 239 723 380 1170 452 141 23 649 26 790 5 320-48 577-125 842-252 716-343 1245-947 1486-1697 215-667 172-1421-116-2049-137-298-290-524-528-783l-112-123 854-854 854-854 58 58c101 99 288 309 405 455 875 1094 1276 2525 1101 3927-171 1367-851 2589-1925 3456-990 800-2251 1211-3539 1153zM9450 4169c-889-48-1792-220-2645-504-1198-399-2279-1010-3286-1857l-44-37 882-882L5238 7l89 70c897 709 1927 1200 3028 1442 863 190 1765 228 2653 111 1308-173 2553-694 3599-1507 79-62 147-113 151-113s402 395 885 878l879 879-139 115c-1663 1383-3692 2173-5873 2288-224 11-832 11-1060-1z"
              transform="matrix(.1 0 0 -.1 0 1917)"
            ></path>
          </svg>
          <p className="pl-2 lg:pl-4 text-white">Login with WunderPass</p>
        </div>
      </a>
      {popup && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            width: '100vw',
            height: '100vh',
            background: '#000C',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <a href="#" onClick={goBack}>
            Go Back
          </a>
          <a href="#" onClick={cancelAuth}>
            Cancel
          </a>
        </div>
      )}
    </>
  );
}
