#!/bin/bash
mkdir -p dist
#mkdir -p proxy
# Remove the dev files
rm -r dist/*
# Using esbuild to build all JS files
#esbuild --bundle src/index.js --outfile=dist/index.js --minify --sourcemap
#esbuild --bundle src/index.js --target=es6 --outfile=dist/index.es6.js --minify --sourcemap
tree --noreport -ifld src | while IFS= read -r fullDir ; do
	dirA=${fullDir/src/}
	dir=${dirA/\//}
	mkdir -p "dist/${dir}"
	cp "src/${dir}/"* "dist/${dir}/" 2>/dev/null
	rm "dist/${dir}/*.md" 2>/dev/null
	rm "dist/${dir}/*.html" 2>/dev/null
	if [ -e "src/${dir}/template.html" ] ; then
		echo "Master template found under \"${dir}\"."
		rm "dist/${dir}/template.html"
		shx live $dir
	fi
done
exit
