#!/bin/sh

usage() {
    echo "Usage: $0 <api|portal> [--build=<development|production>] [-h] [-i|--install=<run|skip>] [-l|--lint=<run|silent|skip>] [-t|--test=<run|silent|skip>]"
    exit $1
}

# Quit with usage if project isn't given or isn't a valid value
if [ $# -lt 1 ]; then
    usage 1
fi

project=$1
shift

if [ $project != 'api' ] && [ $project != 'portal' ]; then
    usage 1
fi

buildTarget='development'
installMode='skip'
lintMode='silent'
testMode='silent'

# Scan options
while :; do
    if [ ! $1 ]; then
        break
    fi

    case $1 in
        --build=?*)
            buildTarget=${1#*=}
            shift
            ;;
        -h)
            usage 0
            ;;
        -i)
            installMode='run'
            shift
            ;;
        --install=?*)
            installMode=${1#*=}
            shift
            ;;
        -l)
            lintMode='run'
            shift
            ;;
        --lint=?*)
            lintMode=${1#*=}
            shift
            ;;
        -t)
            testMode='run'
            shift
            ;;
        --test=?*)
            testMode=${1#*=}
            shift
            ;;
        -?*)
            usage 1
            ;;
    esac
done

# Quit with usage if given options don't conform to expected values
if [ $installMode != 'run' ] && [ $installMode != 'skip' ]; then
    usage 1
fi

if [ $lintMode != 'run' ] && [ $lintMode != 'silent' ] && [ $lintMode != 'skip' ]; then
    usage 1
fi

if [ $testMode != 'run' ] && [ $testMode != 'silent' ] && [ $testMode != 'skip' ]; then
    usage 1
fi

# Run install if set to run
if [ $installMode = 'run' ]; then
    npm install --include dev
fi

# Run lint if set to run or silent; don't fail if set to silent
if [ $lintMode = 'run' ]; then
    npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t lint || exit 1
elif [ $lintMode = 'silent' ]; then
    npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t lint
fi

# Run lint if set to run or silent; don't fail if set to silent
if [ $testMode = 'run' ]; then
    npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t test || exit 1
elif [ $testMode = 'silent' ]; then
    npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t test
fi

# Run build
npx nx run $project:build:$buildTarget
