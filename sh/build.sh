#!/bin/bash
mkdir -p dist
rm -r dist/*
tree --noreport -ifld src | while IFS= read -r fullDir ; do
	dirA=${fullDir/src/}
	dir=${dirA/\//}
	mkdir -p "dist/${dir}"
	cp "src/${dir}/"* "dist/${dir}/" 2>/dev/null
	rm "dist/${dir}/"*.md 2>/dev/null
	rm "dist/${dir}/"*.html 2>/dev/null
	if [ -e "src/${dir}/template.html" ] ; then
		echo "Master template found under \"${dir}\"."
		rm "dist/${dir}/template.html" 2>/dev/null
		shx live $dir
	fi
done
rm build.zip 2>/dev/null
if [ "$BUILD" != "" ] ; then
	echo "Producing precompressed files..."
	tree -ifl dist | grep -E ".(htm|css|js|wasm|svg)" | while IFS= read -r distFile ; do
		zopfli "${distFile}"
		brotli -kvq 11 "${distFile}"
	done
	cd dist
	zip -r0 ../build.zip ./*
	cd ..
fi
exit
