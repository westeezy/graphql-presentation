'use strict';

import request from 'superagent';
import Debug from 'debug';

let debug = new Debug('client:query');
let userId = '559645cd1a38532d14349246';

request
  .get('http://localhost:3000/data')
  .query({
    query: `{
      hello,
      user(id: "${userId}") {
        name
        friends {
          name
          friends {
            name
          }
        }
      }
    }`
  })
  .end(function (err, res) {
    debug(err || res.body);
    debug('friends', res.body.data.user.friends);
  });
