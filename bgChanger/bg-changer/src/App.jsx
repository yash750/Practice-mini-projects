import { useState } from 'react'

function App() {
  const [color, setColor] = useState('grey')
  return (
    <div  className="w-full h-screen duration-200 py-80" style={{backgroundColor: color}}>
      <h1 className="flex justify-center text-3xl font-bold text-black duration-200">Background Changer</h1>
      <div className="fixed flex flex-wrap justify-center bottom-12 inset-x-0 px-2}}">
        <div className="flex flex-wrap justify-center gap-3 shadow-lg bg-white px-3 py-2 rounded-3xl">
            <button onClick={() => setColor('red')} style={{backgroundColor: 'red'}} className="outline-none px-4 py-1 rounded-full text-white shadow-lg">Red</button>
            <button onClick={() => setColor('green')} style={{backgroundColor: 'green'}} className="outline-none px-4 py-1 rounded-full text-white shadow-lg">Green</button>
            <button onClick={() => setColor('blue')} style={{backgroundColor: 'blue'}} className="outline-none px-4 py-1 rounded-full text-white shadow-lg">Blue</button>
            <button onClick={() => setColor('grey')} style={{backgroundColor: 'grey'}} className="outline-none px-4 py-1 rounded-full text-white shadow-lg">Grey</button>
        </div>
      </div>
    </div>
  )
}

export default App