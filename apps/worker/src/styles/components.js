export const containerStyles = `
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--space-10) var(--space-6);
  }
}
`;
export const headerStyles = `
.header {
  margin-bottom: var(--space-10);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: inherit;
}

.logo:hover {
  text-decoration: none;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-info));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  box-shadow: var(--shadow-md);
}

.logo-text {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.5px;
}

.logo-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
`;
export const cardStyles = `
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all var(--transition-fast);
}

.card:hover {
  border-color: var(--color-border-secondary);
  background: var(--color-bg-tertiary);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-link:hover {
  text-decoration: none;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--space-4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.card-meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
`;
export const badgeStyles = `
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  text-transform: capitalize;
  white-space: nowrap;
}

.badge-pending {
  background: rgba(210, 153, 34, 0.15);
  color: var(--color-status-pending);
}

.badge-in_progress {
  background: rgba(88, 166, 255, 0.15);
  color: var(--color-status-in-progress);
}

.badge-completed {
  background: rgba(35, 134, 54, 0.15);
  color: var(--color-status-completed);
}

.badge-cancelled {
  background: rgba(248, 81, 73, 0.15);
  color: var(--color-status-cancelled);
}
`;
export const listStyles = `
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.task-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-4);
}
`;
export const emptyStateStyles = `
.empty-state {
  text-align: center;
  padding: var(--space-16) var(--space-6);
  background: var(--color-bg-secondary);
  border: 2px dashed var(--color-border-primary);
  border-radius: var(--radius-xl);
}

.empty-state-icon {
  font-size: 56px;
  margin-bottom: var(--space-4);
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-2);
}

.empty-state-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  max-width: 320px;
  margin: 0 auto;
}
`;
export const detailStyles = `
.detail-container {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding-bottom: var(--space-6);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.detail-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-2);
}

.detail-id {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.detail-section {
  margin-bottom: var(--space-6);
}

.detail-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-2);
}

.detail-value {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

.detail-timestamps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border-primary);
}
`;
export const linkStyles = `
.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-link);
  margin-bottom: var(--space-6);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-accent-purple);
  text-decoration: none;
}
`;
export const errorStyles = `
.error-container {
  text-align: center;
  padding: var(--space-16) var(--space-6);
}

.error-container h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-accent-danger);
  margin-bottom: var(--space-4);
}

.error-container p {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.error-container code {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  background: var(--color-bg-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}
`;
export const headingStyles = `
h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.5px;
  margin-bottom: var(--space-4);
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
}
`;
