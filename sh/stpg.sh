#!/bin/bash
# Simple Template Page Generator
deno run --allow-read --allow-write deno/simple_template/index.js "$1" "$2"
exit