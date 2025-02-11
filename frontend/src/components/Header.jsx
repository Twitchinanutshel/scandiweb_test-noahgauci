import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <div>
      <div>
        <Link data-testid='category-link' to='/clothes'>CLOTHES</Link>
        <Link data-testid='category-link' to='/tech'>TECH</Link>
      </div>
      <div>
        <Link to='/'>Company Logo</Link>
      </div>
      <div>
        <Link to='cart'>CART</Link>
      </div>
    </div>
  )
}

export default Header