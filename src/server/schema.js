import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean
} from 'graphql/type';

import co from 'co';
import User from './models/user';
import Interests from './models/interests';
import mongoose from 'mongoose';

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */
function getFieldList(context, asts = context.fieldASTs) {
  //for recursion...Fragments doesn't have many sets...
  if (!Array.isArray(asts)) asts = [asts];

  //get all selectionSets
  let selections = asts.reduce((selections, source) => {
    selections.push(...source.selectionSet.selections);
    return selections;
  }, []);

  //return fields
  return selections.reduce((list, ast) => {
    switch (ast.kind) {
      case 'Field' :
        list[ast.name.value] = true;
      return list;
      case 'InlineFragment':
        return {
        ...list,
        ...getFieldList(context, ast)
      };
      case 'FragmentSpread':
        return {
        ...list,
        ...getFieldList(context, context.fragments[ast.name.value])
      };
      default:
        throw new Error('Unsuported query selection');
    }
  }, {});
}


let interestType = new GraphQLObjectType({
  name: 'Interest',
  description: 'An Interest',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the interest.'
    },
    name: {
      type: GraphQLString,
      description: 'The name of the interest.'
    }
  })
});

let userType = new GraphQLObjectType({
  name: 'User',
  description: 'User creator',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the user.'
    },
    name: {
      type: GraphQLString,
      description: 'The name of the user.'
    },
    interests: {
      type: new GraphQLList(interestType),
      description: 'The interests of the user, or an empty list if they have none.',
      resolve: (user) => {
        return Interests.find({
          _id: {
            $in: user.interests
          }
        });
      }
    },
    friends: {
      type: new GraphQLList(userType),
      description: 'The friends of the user, or an empty list if they have none.',
      resolve: (user, params, source) => {
        let projections = getFieldList(source);
        return User.find({
          _id: {
            // to make it easily testable
            $in: user.friends.map((id) => id.toString())
          }
        }, projections);
      }
    }
  })
});

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: function() {
          return 'world';
        }
      },
      interests: {
        type: new GraphQLList(interestType),
        resolve: function() {
          return Interests.find();
        }
      },
      users: {
        type: new GraphQLList(userType),
        args: {
          limit: {
            name: 'limit',
            type: GraphQLInt
          },
          hasFriends: {
            name: 'hasFriends',
            type: GraphQLBoolean
          },
          interestedIn: {
            name: 'interestedIn',
            type: GraphQLString
          }
        },
        resolve: function(root, {limit, hasFriends, interestedIn}) {
          let query = {};
          if(hasFriends) {
            query.friends = { $exists: true, $not: { $size: 0} };
          }
          if(interestedIn) {
            query.interests = {$in: [mongoose.Types.ObjectId(interestedIn)]};
          }
          return limit ? User.find(query).limit(limit) : User.find(query);
        }
      },
      user: {
        type: userType,
        args: {
          id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: (root, {id}, source) => {
          let projections = getFieldList(source);
          return User.findById(id, projections);
        }
      }
    }
  }),

  // mutation
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: userType,
        args: {
          name: {
            name: 'name',
            type: GraphQLString
          }
        },
        resolve: (obj, {name}) => co(function *() {
          let user = new User();
          user.name = name;


          return yield user.save();
        })
      },
      deleteUser: {
        type: userType,
        args: {
          id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: (obj, {id}) => co(function *() {
          return yield User.findOneAndRemove({_id: id});
        })
      },
      updateUser: {
        type: userType,
        args: {
          id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLString)
          },
          name: {
            name: 'name',
            type: GraphQLString
          }
        },
        resolve: (obj, {id, name}, source) => co(function *() {
          let projections = getFieldList(source);

          yield User.update({
            _id: id
          }, {
            $set: {
              name: name
            }
          });

          return yield User.findById(id, projections);
        })
      }
    }
  })
});

export default schema;
