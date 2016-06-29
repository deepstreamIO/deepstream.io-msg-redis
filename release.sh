#!/bin/bash
set -e

if [ -z $1 ]; then
	echo "Please provide a release version: patch, minor or major"
	exit
fi

if [ $( npm whoami ) != "deepstreamio" ]; then
	echo "Please verify you can log into npm as deepstreamio before trying to release"
	exit
fi

echo 'Starting release'
npm version $1

echo 'Pushing to github'
git push --follow-tags

echo 'Publishing to npm'
npm publish

echo "Now we wait for the CI to build and upload artifacts to release"