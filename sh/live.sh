#!/bin/bash
ls -1 "src/${1}/" | grep -i ".json" | while IFS= read -r file ; do
	rm "dist/${1}/${file}"
	echo "Initiating build for \"${file}\"!"
	shx stpg "vapour.json" "src/${1}/${file}" > "dist/${1}/${file/json/htm}"
done
exit