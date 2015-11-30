'use strict';

import {expect} from 'chai';
import {getProjection} from './schema';

describe('schema', function () {
  describe('helpers', function () {
    // TODO: update this spec for graphql 0.4
    xit('should generate projection object', function () {
      var projection = getProjection({
        selectionSet: {
          selections: [
            {
            name: {
              value: 'name'
            }
          },
          {
            name: {
              value: 'age'
            }
          }
          ]
        }
      });

      expect(projection).to.be.eql({
        name: 1,
        age: 1
      });
    });
  });
});
