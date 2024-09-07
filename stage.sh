#!/bin/sh

usage() {
    echo "Usage: $0 [-h] [--out=<out-dir>]"
    exit $1
}

distDir='./dist'
outDir=$OUT_DIRECTORY

# Scan options
while :; do
    if [ ! $1 ]; then
        break
    fi

    case $1 in
        -h)
            usage 0
            ;;
        --out=?*)
            outDir=${1#*=}
            shift
            ;;
        -?*)
            usage 1
            ;;
    esac
done

# Copy build content to out if directory specified
mkdir -p $outDir
rm -r $outDir/*
cp -r $distDir/* $outDir
