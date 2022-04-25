import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function useUser() {
  const [wunderId, setWunderId] = useState(null)
  const [address, setAddress] = useState(null)
  const router = useRouter();

  const updateWunderId = (id) => {
    localStorage.setItem('wunderId', id);
    setWunderId(id);
  }

  const updateAddress = (addr) => {
    localStorage.setItem('address', addr);
    setAddress(addr);
  }

  const logOut = () => {
    localStorage.removeItem('address');
    localStorage.removeItem('wunderId');
    setWunderId(null);
    setAddress(null);
    router.push('/');
  }

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'))
    setAddress(localStorage.getItem('address'))
  }, [])

  return { wunderId, address, updateWunderId, updateAddress, logOut }
}