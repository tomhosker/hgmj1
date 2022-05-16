#!/bin/sh

### This script (1) pushes the local master branch to the master branch of
### Heroku's main remote, and (2) pushes said local branch to the "origin"
### remote.

# Crash on the first failure.
set -e

# Let's get cracking...
git push heroku master
git push origin master
