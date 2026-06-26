import './globals.css'
import Cursor from '@/components/Cursor/Cursor'
import Navbar  from '@/components/Navbar/Navbar'

export const metadata = {
  title: 'Atul — AI/ML Engineer',
  description: 'Portfolio of Atul — AI/ML Engineer passionate about building intelligent AI systems, LLM-powered apps, and impactful digital products.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Cursor />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
