import { useEffect, useState } from "react"

export default function useUser() {
  const [wunderId, setWunderId] = useState(null)
  const [address, setAddress] = useState(null)

  const updateWunderId = (id) => {
    localStorage.setItem('wunderId', id);
    setWunderId(id);
  }

  const updateAddress = (addr) => {
    localStorage.setItem('address', addr);
    setAddress(addr);
  }

  useEffect(() => {
    setWunderId(localStorage.getItem('wunderId'))
    setAddress(localStorage.getItem('address'))
  })
  
  return {wunderId, address, updateWunderId, updateAddress}
}