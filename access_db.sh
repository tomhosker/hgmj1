#!/bin/bash

# This is a quick script to pull up the Heroku Postgres interface for this
# application.

# Constants.
APP_NAME="hgmj"

# Check that we're logged into Heroku.
if ! heroku whoami >/dev/null; then
    heroku login
fi

gnome-terminal -- heroku pg:psql --app $APP_NAME

# Run the below in order to run an SQL script.
#     gnome-terminal -- heroku pg:psql --app hgmj < create_drop.sql
