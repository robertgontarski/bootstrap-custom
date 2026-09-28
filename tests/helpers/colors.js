const COLOR_FAMILY_NAMES = [
	'blue',
	'indigo',
	'purple',
	'pink',
	'red',
	'orange',
	'yellow',
	'green',
	'teal',
	'cyan',
	'gray',
];

const COLOR_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

/**
 * The 11 color families x 9 weights (`$all-colors` in
 * `src/styles/modules/_colors.scss`), as `<family>-<weight>` keys.
 * @type {string[]}
 */
export const ALL_COLORS = COLOR_FAMILY_NAMES.flatMap((family) =>
	COLOR_WEIGHTS.map((weight) => `${family}-${weight}`),
);
