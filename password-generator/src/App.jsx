import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const passwordRef = useRef(null)
  const [length, setLength] = useState(6)
  const [numberIncluded, setNumberIncluded] = useState(false)
  const [characterIncluded, setCharacterIncluded] = useState(false)
  const [password, setPassword] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select()
    passwordRef.current?.setSelectionRange(0, 999)
    navigator.clipboard.writeText(password)
    setIsCopied(true)
  }, [password])

  const generatePassword = useCallback(() => {
    let pass = ""
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*()_+"
    if(numberIncluded) str += numbers
    if(characterIncluded) str += symbols
    for(let i = 0; i < length; i++) {
      let randomNum = Math.floor(Math.random() * str.length+1)
      pass += str.charAt(randomNum)
    }
    setPassword(pass)
}, [setPassword, length, numberIncluded, characterIncluded])

  useEffect(() => {
    generatePassword()
    setIsCopied(false)
  }, [generatePassword, length, numberIncluded, characterIncluded])

  return (
    <div className='flex flex-col items-center gap-y-5 h-80 bg-gray-200 max-w-4xl mx-auto rounded-xl'>
     <div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 bg-gray-800 text-orange-500">  
        <h1 className='text-white text-center my-3'>Random Password Generator</h1>
     </div>
     <div>
        <div className="flex shadow rounded-lg overflow-hidden mb-6 border border-gray-300">
          <input type="text" value={password} placeholder="Password" ref={passwordRef}
          className='outline-none w-full py-1 px-3' readOnly />
          <button onClick={copyPasswordToClipboard} className='outline-none bg-blue-700 text-white px-3 py-0.5 shrink-0 hover:bg-blue-600 cursor-pointer'>
          {isCopied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className='flex text-sm gap-x-2' >
          <div className='flex items-center gap-x-1'>
            <input type='range' min={6} max={100} value={length} onChange={(e) => setLength(e.target.value)} className='cursor-pointer'/>
            <label>Length: {length}</label>
          </div>
          <div className="flex items-center gap-x-1">
            <input type='checkbox' id='numberInput'  defaultChecked={numberIncluded} onChange={() => setNumberIncluded((prev) => !prev)}/>
            <label htmlFor="numberInput">Numbers</label>
          </div>
          <div className="flex items-center gap-x-1">
            <input type='checkbox' id='characterInput' defaultChecked={characterIncluded} onChange={() => setCharacterIncluded((prev) => !prev)} />
            <label htmlFor="characterInput">Special Characters</label>
          </div>
        </div>
     </div>
    </div>
  )
}

export default App
