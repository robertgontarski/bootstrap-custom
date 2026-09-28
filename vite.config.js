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

// `vite build --mode site` (npm run build:site) also builds the index.html demo
// into dist-site/ for Vercel; the default build keeps dist/ to bootstrap.css only.
export default defineConfig(({mode}) => {
	const isSite = mode === 'site';

	return {
		resolve: {
			alias: {
				'@bootstrap': path.resolve(import.meta.dirname, 'node_modules/bootstrap/'),
			},
		},
		build: {
			cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'],
			rolldownOptions: {
				input: [
					...getFilesFromDir(path.resolve(import.meta.dirname, 'src/styles'), [
						{extension: '.scss', exceptions: [/^_/]},
					]),
					...(isSite ? [path.resolve(import.meta.dirname, 'index.html')] : []),
				],
				output: {
					entryFileNames: '[name].js',
					chunkFileNames: '[name].js',
					assetFileNames: '[name][extname]',
				},
			},
			outDir: isSite ? 'dist-site' : 'dist',
			assetsDir: '.',
			emptyOutDir: true,
		}
	};
});