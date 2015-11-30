'use strict';

require('babel/register');

let debug = require('debug');
debug.enable('client*');

require('./query');
require('./mutation');
