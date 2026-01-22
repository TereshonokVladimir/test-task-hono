import type { FC, PropsWithChildren } from 'hono/jsx'

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
        <style>{`
          :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-tertiary: #1a1a24;
            --text-primary: #e8e8ed;
            --text-secondary: #9898a8;
            --text-muted: #6a6a78;
            --accent: #6366f1;
            --accent-hover: #818cf8;
            --success: #22c55e;
            --warning: #f59e0b;
            --error: #ef4444;
            --border: #2a2a38;
            --radius: 12px;
            --font: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --font-mono: 'SF Mono', 'Fira Code', monospace;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: var(--font);
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 24px;
          }

          header {
            margin-bottom: 48px;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: var(--text-primary);
          }

          .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--accent), #a855f7);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }

          .logo-text {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          .subtitle {
            color: var(--text-secondary);
            font-size: 14px;
            margin-top: 8px;
          }

          h1 {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 24px;
          }

          .task-count {
            color: var(--text-muted);
            font-size: 14px;
            margin-bottom: 24px;
          }

          .task-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .task-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 20px 24px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            display: block;
          }

          .task-card:hover {
            background: var(--bg-tertiary);
            border-color: var(--accent);
            transform: translateY(-2px);
          }

          .task-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .task-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .task-description {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .task-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 12px;
            color: var(--text-muted);
          }

          .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
          }

          .status-pending {
            background: rgba(245, 158, 11, 0.15);
            color: var(--warning);
          }

          .status-in_progress {
            background: rgba(99, 102, 241, 0.15);
            color: var(--accent);
          }

          .status-completed {
            background: rgba(34, 197, 94, 0.15);
            color: var(--success);
          }

          .status-cancelled {
            background: rgba(239, 68, 68, 0.15);
            color: var(--error);
          }

          .empty-state {
            text-align: center;
            padding: 80px 24px;
            background: var(--bg-secondary);
            border-radius: var(--radius);
            border: 1px dashed var(--border);
          }

          .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .empty-state-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .empty-state-text {
            color: var(--text-secondary);
            font-size: 14px;
          }

          .detail-container {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 32px;
          }

          .detail-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
          }

          .detail-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .detail-id {
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--text-muted);
            background: var(--bg-tertiary);
            padding: 4px 8px;
            border-radius: 4px;
          }

          .detail-section {
            margin-bottom: 24px;
          }

          .detail-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }

          .detail-value {
            font-size: 16px;
            color: var(--text-primary);
          }

          .detail-timestamps {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            padding-top: 24px;
            border-top: 1px solid var(--border);
          }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--accent);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 24px;
            transition: color 0.2s;
          }

          .back-link:hover {
            color: var(--accent-hover);
          }

          .error-container {
            text-align: center;
            padding: 80px 24px;
          }

          .error-container h1 {
            color: var(--error);
          }

          .error-container p {
            color: var(--text-secondary);
            margin-bottom: 24px;
          }

          .error-container code {
            background: var(--bg-secondary);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: var(--font-mono);
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          <header>
            <a href="/" class="logo">
              <div class="logo-icon">📋</div>
              <div>
                <div class="logo-text">Task Manager</div>
                <div class="subtitle">Powered by Cloudflare Workers</div>
              </div>
            </a>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
