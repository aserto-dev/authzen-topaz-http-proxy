import React from 'react'
import ReactDOM from 'react-dom/client'
import Component from '@aserto/authzen-interop-react'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Component
      vendor="Topaz"
      logo="topaz.png"
      url="https://www.topaz.sh"
      pdpurl="https://topaz-todo-proxy.authzen-interop.net"
    />
  </React.StrictMode>
)
