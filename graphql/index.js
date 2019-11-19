const graphql = require('graphql')
const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLBoolean, GraphQLFloat } = graphql
const mongoose = require('mongoose')

// Schema
const SensorData = require('../schema/models/SensorData')

// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

const SensorDataType = new GraphQLObjectType({
    name: 'SensorData',
    fields: () => ({
        id: {type: GraphQLString},
        character: {type: GraphQLString},
        timestamp: {type: GraphQLString}
    })
})

const AuthDataType = new GraphQLObjectType({
    name: 'AuthData',
    fields: () => ({
        userId: {type: GraphQLNonNull(GraphQLString)},
        token: {type: GraphQLNonNull(GraphQLString)},
        tokenExpiration: {type: GraphQLNonNull(GraphQLString)}
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        getCharacter: {
            type: GraphQLString,
            async resolve (parent, args, req) {
                return await SensorData.find()
            }
        }
    }
})

const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
        clearData: {
            type: GraphQLNonNull(GraphQLString),
            async resolve (parent, args, req) {
                await SensorData.remove()
            }
        },
        sendCharacter: {
            type: GraphQLNonNull(SensorDataType),
            args: {
                character: {type: GraphQLNonNull(GraphQLString)},
                timestamp: {type: GraphQLNonNull(GraphQLString)}
            },
            async resolve (parent, args, req) {
                const sensorData = new SensorData({
                    character: args.character,
                    timestamp: args.timestamp
                })
                console.log('Character Acquired: ', args.character)
                return await sensorData.save()
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
})