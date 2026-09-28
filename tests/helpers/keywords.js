/**
 * `$all-cursors` in `src/styles/modules/elements/_cursor.scss`.
 * @type {string[]}
 */
export const ALL_CURSORS = [
	'auto',
	'default',
	'none',
	'context-menu',
	'help',
	'pointer',
	'progress',
	'wait',
	'cell',
	'crosshair',
	'text',
	'vertical-text',
	'alias',
	'copy',
	'move',
	'no-drop',
	'not-allowed',
	'grab',
	'grabbing',
	'e-resize',
	'n-resize',
	'ne-resize',
	'nw-resize',
	's-resize',
	'se-resize',
	'sw-resize',
	'w-resize',
	'ew-resize',
	'ns-resize',
	'nesw-resize',
	'nwse-resize',
	'col-resize',
	'row-resize',
	'all-scroll',
	'zoom-in',
	'zoom-out',
];

/**
 * `$all-displays` in `src/styles/modules/elements/_display.scss`.
 * @type {string[]}
 */
export const ALL_DISPLAYS = [
	'none',
	'inline',
	'inline-block',
	'block',
	'grid',
	'inline-grid',
	'flex',
	'inline-flex',
	'table',
	'table-row',
	'table-cell',
	'contents',
	'flow-root',
];

/**
 * `$grid-breakpoints` order, `xs` first (no media query, comes first among
 * the breakpoint group per `media-breakpoint-up`).
 * @type {string[]}
 */
export const BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

/**
 * `$font-sizes` named keys in `_size.scss` (`$fs-sizes` = these + arbitrary).
 * @type {string[]}
 */
export const FS_NAMED_KEYS = ['1', '2', '3', '4', '5', '6'];

const MIN_ARBITRARY_FONT_SIZE = 8;
const MAX_ARBITRARY_FONT_SIZE = 100;

/**
 * `$fs-arbitrary-sizes` keys (`[8px]`..`[100px]`) in `_size.scss`.
 * @type {string[]}
 */
export const FS_ARBITRARY_KEYS = Array.from(
	{length: MAX_ARBITRARY_FONT_SIZE - MIN_ARBITRARY_FONT_SIZE + 1},
	(_, i) => `[${i + MIN_ARBITRARY_FONT_SIZE}px]`,
);

/**
 * `$fs-sizes` keys: named forms first, then arbitrary (`_size.scss`).
 * @type {string[]}
 */
export const FS_SIZE_KEYS = [...FS_NAMED_KEYS, ...FS_ARBITRARY_KEYS];

/**
 * `$all-line-clamps` in `src/styles/modules/elements/_line-clamp.scss`.
 * @type {string[]}
 */
export const ALL_LINE_CLAMPS = ['1', '2', '3', '4', '5', '6', 'none'];
