#!/bin/sh

echo "I'm going to install some APT packages system-wide."
echo "To do so, I'm going to need superuser privileges."
echo "(I'll also install some PIP packages, but I won't need sudo for that.)"
sudo echo "Superuser privileges: activate!"

# Install Heroku Command Line Interface.
sudo snap install --classic heroku
# Install PostgreSQL.
sudo apt --yes install postgresql
# Install the standard Ubuntu terminal (if necessary).
sudo apt --yes install gnome-terminal
# Install Python.
sudo apt --yes install python3
# Install PIP and its packages packages.
sudo apt --yes install python3-pip
pip3 install -r pip-requirements.txt
