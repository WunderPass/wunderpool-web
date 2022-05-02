import { useEffect, useState } from "react";
import { AppBar, Link, Stack, Toolbar } from "@mui/material";
import Image from "next/image";
import WunderPoolIcon from "/public/wunderpool_logo_white.svg";
import { usdcBalanceOf } from "/services/contract/token";
import { currency } from "/services/formatter";

export default function Navbar(props) {
  const { user } = props;
  const [usdcBalance, setUsdcBalance] = useState(true);

  useEffect(() => {
    if (!user.address) return;
    usdcBalanceOf(user.address).then((balance) => {
      setUsdcBalance(balance);
    });
  }, [user.address]);

  return (
    <AppBar
      className="bg-gradient-to-r from-wunder-light-blue to-wunder-blue"
      position="static"
    >
      <Toolbar>
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
          <Link href="/">
            <a>
              <div className="flex flex-row">
                <div className="pt-0.5 w-44 pr-3">
                  <Image
                    src={WunderPoolIcon}
                    alt="WunderPoolIcon"
                    layout="responsive"
                  />
                </div>
              </div>
            </a>
          </Link>
        </Stack>
        {user.loggedIn && (
          <>
            <div className="text-lg text-white border-solid border-2 border-white rounded-lg w-fit p-0.5 my-2 sm:py-1.5 py-3.5">
              <div className="flex flex-row pr-1 text-center items-center text-sm font-bold">
                <p className="mx-2">{currency(usdcBalance, {})}</p>
              </div>
            </div>
            <button
              className="btn ml-2 my-2 sm:py-2.5 py-3.5 hover:bg-[#ff0000] text-sm"
              onClick={user?.logOut}
              variant="contained"
            >
              Log out
            </button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
