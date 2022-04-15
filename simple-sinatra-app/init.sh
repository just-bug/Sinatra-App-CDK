#!/bin/sh
/usr/local/bin/bundle install
/usr/local/bin/rackup -p80 --host 0.0.0.0 &