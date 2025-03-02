import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <div className='flex justify-between mx-24'>
      <div className='flex gap-5'>
        <Link data-testid='category-link' to='/clothes'>CLOTHES</Link>
        <Link data-testid='category-link' to='/tech'>TECH</Link>
      </div>
      <div>
        <Link to='/clothes'>Company Logo</Link>
      </div>
      <div>
        <Link to='cart'>CART</Link>
      </div>
    </div>
  )
}

export default Header