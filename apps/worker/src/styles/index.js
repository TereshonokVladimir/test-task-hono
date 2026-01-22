import { cssVariables, cssReset } from './variables';
import { containerStyles, headerStyles, cardStyles, badgeStyles, listStyles, emptyStateStyles, detailStyles, linkStyles, errorStyles, headingStyles, } from './components';
export const globalStyles = `
${cssVariables}
${cssReset}
${containerStyles}
${headerStyles}
${cardStyles}
${badgeStyles}
${listStyles}
${emptyStateStyles}
${detailStyles}
${linkStyles}
${errorStyles}
${headingStyles}
`;
