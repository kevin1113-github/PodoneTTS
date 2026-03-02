import { Link } from 'react-router'
import React from 'react'

export default function Electron(): React.JSX.Element {
  return (
    <main className="p-4 h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-xl w-full space-y-6">
        <section className="p-4 border border-gray-800 rounded bg-gray-900 text-gray-100">
          <h2 className="text-lg font-bold mb-2">포도네 TTS</h2>
          <p className="text-sm text-gray-300 mb-4">
            <Link to="/" target="_blank" rel="noopener noreferrer" className="underline">
              http://localhost:3000/
            </Link>{' '}
            에서 TTS 리모콘이 실행중 입니다.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-800"
            >
              웹 브라우저에서 열기
            </Link>
            <button
              type="button"
              className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-800"
              onClick={() => {
                navigator.clipboard.writeText('http://localhost:3000/')
                alert('링크가 복사되었습니다.')
              }}
            >
              링크 복사하기
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
