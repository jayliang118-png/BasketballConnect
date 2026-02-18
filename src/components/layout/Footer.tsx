'use client'

export function Footer() {
  return (
    <footer className="border-t border-court-border mt-auto">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-600">
        <span>Powered by Squadi API</span>
        <span>Basketball Hub {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
