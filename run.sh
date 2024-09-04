#!/bin/sh

usage() {
    echo "Usage: $0 <api|portal> [-h] [-o|--out=<out-dir>]"
    exit $1
}

# Quit with usage if project isn't given or isn't a valid value
if [ $# -lt 1 ]; then
    usage 1
fi

distDir=''
project=$1
shift

case $project in
    api)
        distDir='./dist/api'
        ;;
    portal)
        distDir='./dist/portal'
        ;;
    *)
        usage 1
        ;;
esac

echo distDir=$distDir
echo project=$project

copyToOut=false
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
        -o)
            copyToOut=true
            shift
            ;;
        --out=?*)
            copyToOut=true
            outDir=${1#*=}
            shift
            ;;
        -?*)
            usage 1
            ;;
    esac
done

# Copy build content to out if directory specified
if [ $copyToOut ]; then
    cp -r $distDir $outDir
fi

node --inspect=0.0.0.0:9229 $distDir/main.js
