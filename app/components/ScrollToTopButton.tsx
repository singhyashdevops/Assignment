import { FC } from 'react'

interface Props { visible: boolean }

const ScrollTopButton: FC<Props> = ({ visible }) => (
  <button
    className={`fixed z-50 bottom-5 right-5 p-2 rounded bg-amazon-gray-dark text-white hover:bg-amazon-gray transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  >
    Back to Top
  </button>
)

export default ScrollTopButton
