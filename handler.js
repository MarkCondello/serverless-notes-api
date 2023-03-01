'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb"), // installed in node_modules aws-sdk@2
documentClient = new DynamoDB.DocumentClient({ region: 'us-east-1' });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME // set in the .yml

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data)
  }
}

module.exports.createNote = async (event, context, callback) => {
  let data = JSON.parse(event.body)
  try {
    const params = {
      TableName : NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)" // checks if there is no existing note first
    }
    await documentClient.put(params).promise() // store in notes table

    callback(null, send(201, data))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};

//API gateway will extract the note's id in the request with pathParameters
module.exports.updateNote = async (event, context, callback) => {
  const notesId = event.pathParameters.id;
  const data = JSON.parse(event.body);
  try {
    const params = {
      TableName : NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "SET #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body"
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body
      },
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(notesId)"
    }
    await documentClient.update(params).promise() // update an item in notes table
    callback(null, send(200, data))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};


module.exports.deleteNote = async (event, context, callback) => {
  const notesId = event.pathParameters.id;
  try {
    const params = {
      TableName : NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "DELETE",
      ConditionExpression: "attribute_exists(notesId)"
    }
    await documentClient.delete(params).promise() // delete an item in notes table
    callback(null, send(200, notesId))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};

module.exports.getAllNotes = async (event, context, callback) => {
  try {
    const params = {
      TableName : NOTES_TABLE_NAME,
    }
    const notes = await documentClient.scan(params).promise() // get all notes in the table
    callback(null, send(200, notes))
  } catch(err) {
    callback(null, send(500, err.message))
  }
};


