import {defineConfig} from 'vite';
import path from 'path';
import {readdirSync} from 'fs';

function getFilesFromDir(dir, extensionsConfig = []) {
	const files = readdirSync(dir, {withFileTypes: true});
	return files
		.filter((file) => {
			if (file.isDirectory()) {
				return false;
			}

			const fileExtension = path.extname(file.name).toLowerCase();
			const extensionConfig = extensionsConfig.find(
				(ext) => ext.extension === fileExtension
			);

			if (!extensionConfig) {
				return false;
			}

			return !(extensionConfig.exceptions &&
				extensionConfig.exceptions.some((regex) => regex.test(file.name)));
		})
		.map((file) => path.join(dir, file.name));
}

export default defineConfig({
	resolve: {
		alias: {
			'@bootstrap': path.resolve(__dirname, 'node_modules/bootstrap/'),
		},
	},
	build: {
		rollupOptions: {
			input: [
				...getFilesFromDir(path.resolve(__dirname, 'src/styles'), [
					{extension: '.scss', exceptions: [/^_/]},
				])
			],
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
				assetFileNames: '[name][extname]',
			},
		},
		outDir: 'dist',
		assetsDir: '.',
		emptyOutDir: true,
	}
});