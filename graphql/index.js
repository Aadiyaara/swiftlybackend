const graphql = require('graphql')
const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID, GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLBoolean, GraphQLFloat } = graphql
const mongoose = require('mongoose')

// Schema
const SensorData = require('../schema/models/SensorData')
const User = require('../schema/models/User')

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
        loginUser: {
            type: GraphQLNonNull(AuthDataType),
            args: {
                email: {type: GraphQLNonNull(GraphQLString)},
                password: {type: GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args) {
                try {
                    const user = await User.findOne({ email: args.email })
                    if(!user) {
                        console.log('User does not Exist')
                        throw new Error('User does not exist')
                    }
                    const isEqual = await bcrypt.compare(args.password, user.tokenizedPassword)
                    if(!isEqual) throw new Error('Invalid Password')
                    const token = jwt.sign({userId: user.id}, 'ninenine', {
                        expiresIn: '8760h'
                    })
                    return { userId: user.id, token: token, tokenExpiration: 8760 }
                }
                catch (err) {
                    console.log('Error loggin in the user: ', err)
                    return err
                }
            }
        },
        getCharacter: {
            type: GraphQLList(SensorDataType),
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
                return 'Done'
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
        },
        createUser: {
            type: AuthDataType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                password: {type: GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args) {
                try {
                    const user = await User.findOne({ email: args.email })
                    if(user) {
                        throw new Error('User exists already')
                    }
                    const hashedPassword = await bcrypt.hash(args.password, 12)
                    const newUser = new User({
                        name: args.name,
                        email: args.email,
                        tokenizedPassword: hashedPassword,
                        status: 'Active'
                    })
                    const savedUser = await newUser.save()
                    const token = jwt.sign({userId: savedUser.id}, 'ninenine', {
                        expiresIn: '8760h'
                    })
                    return { userId: savedUser.id, token: token, tokenExpiration: 8760 }
                }
                catch (err) {
                    console.log('Error Creating a new User')
                    return err
                }
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
})