#!/bin/bash
set -e

# cd to the directory of this script
cd $(cd -P -- "$(dirname -- "$0")" && pwd -P)

rm -rf ".tmp"
mkdir ".tmp"
cd ".tmp"

tmpDirPath=$(pwd)

displayCmd(){
    echo -e "\e[1;32mcmd: $1\e[0m"
}

echoGreen(){
    echo -e "\e[1;32m$1"
}

neuPath="node $(pwd)/../../bin/neu.js"

neu(){
    $neuPath $@
}

echo -e "\e[1;32mTesting Neutralinojs CLI commands\n"

# neu

displayCmd "neu --help"
neu --help
echo

# create

displayCmd "neu create <app name>"
neu create myapp
echo

displayCmd "neu create <app name> --template <template>"
neu create myapp-zero --template neutralinojs/neutralinojs-zero
echo

displayCmd "neu create --help"
neu create --help
echo

# version (global version)

displayCmd "neu version"
neu version
echo

# run

echoGreen "Creating a sample app before running $neuPath run & neu build"
neu create myapp-run
cd myapp-run
echo

displayCmd "$neuPath run"
xvfb-run $neuPath run &
sleep 20s
kill -HUP $(pgrep neutralino)
sleep 10s
echo

displayCmd "$neuPath run --disable-auto-reload"
xvfb-run $neuPath run --disable-auto-reload &
sleep 20s
kill -HUP $(pgrep neutralino)
sleep 10s
echo

displayCmd "$neuPath run --arch"
xvfb-run $neuPath run --arch x64 &
sleep 20s
kill -HUP $(pgrep neutralino)
sleep 10s
echo

isServerUp(){
    local stts=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)
    if [ "$stts" == "200" ]; then
        echo -e "\e[1;32mServer is up\e[0m"
        return 0
    else
        echo -e "\e[1;31mServer is starting\e[0m"
        return 10
    fi
}

echoGreen "Creating the environment to run the app with flag --frontend-lib-dev"
echo
neu create myapp-react --template codezri/neutralinojs-react
echo
cd myapp-react && cd react-src && npm i > /dev/null 2>&1 && npm run build  > /dev/null 2>&1
npm start &
displayCmd "$neuPath run --frontend-lib-dev"
until isServerUp;
do
  sleep 3s
done
cd .. && xvfb-run $neuPath run --frontend-lib-dev &
sleep 20s
kill -HUP $(pgrep neutralino)
sleep 10s
kill `lsof -t -i:3000`
echo

displayCmd "$neuPath run --help"
neu run --help
echo

# build

neu create myapp-build
cd myapp-build

displayCmd "neu build"
neu build
echo

displayCmd "neu build --release"
neu build --release
echo

echoGreen "Creating .storage directory before running neu build --copy-storage"
mkdir .storage
echo

displayCmd "neu build --copy-storage"
neu build --copy-storage
echo

displayCmd "neu build --help"
neu build --help
echo

# update

displayCmd "neu update"
neu update
echo

# version (project-specific versions)

displayCmd "neu version"
neu version
echo

# plugins

displayCmd "neu plugins --add <plugin>"
neu plugins --add @neutralinojs/appify
echo

displayCmd "neu plugins --remove <plugin>"
neu plugins --remove @neutralinojs/appify
echo

displayCmd "neu plugins --help"
neu plugins --help
echo

rm -rf $tmpDirPath