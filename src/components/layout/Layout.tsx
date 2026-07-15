import type { ReactNode } from 'react'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  )
}
