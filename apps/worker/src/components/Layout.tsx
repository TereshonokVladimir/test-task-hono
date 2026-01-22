import type { FC, PropsWithChildren } from 'hono/jsx'
import { globalStyles } from '../styles'

interface LayoutProps extends PropsWithChildren {
  title: string
}

export const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | Task Manager</title>
        <style>{globalStyles}</style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <a href="/" class="logo">
              <div class="logo-icon">📋</div>
              <div>
                <div class="logo-text">Task Manager</div>
                <div class="logo-subtitle">Powered by Cloudflare Workers</div>
              </div>
            </a>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
