import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import ConfusionMatrix from '../src'

function App() {
  const [lockAxis, setLockAxis] = useState(true)

  return (
    <div>
      <input
        id="lockAxisCheckbox"
        type="checkbox"
        defaultChecked={lockAxis}
        onChange={e => setLockAxis(e.target.checked)}
      />
      <label htmlFor="lockAxisCheckbox">Scroll both axis</label>
      <ConfusionMatrix
        columnTitles={['a', 'b', 'c', 'd', 'e', 'f']}
        data={[
          [1, 2, 3, 4, 5, 6],
          [3, 4, 5, 6, 7, 8],
          [1, 1, 1, 1, 1, 1],
          [5, 5, 5, 5, 5, 5],
          [5, 5, 5, 5, 5, 5],
          [5, 5, 5, 5, 5, 5],
        ]}
        headerTitles={['a', 'b', 'c', 'd', 'e', 'f']}
        lockAxis={lockAxis}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
