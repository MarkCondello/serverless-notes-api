'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb"), // installed in node_modules aws-sdk@2
documentClient = new DynamoDB.DocumentClient({ region: 'us-east-1' });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME // set in the .yml

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

    callback(null,
      {
        statusCode: 201,
        body: JSON.stringify(data),
      }
    )
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err.message, "An issue occured when creating a new note."),
    };
  }
};

//API gateway will extract the note's id in the request
module.exports.updateNote = async (event, context, callback) => {
  const noteId = event.pathParameters.id,
  data = JSON.parse(event.body)
  try {
    const params = {
      TableName : NOTES_TABLE_NAME,
      Key: { noteId },
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title' : 'title',
        '#body' : 'body',
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body,
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }
    await documentClient.update(params).promise() // store in notes table

    callback(null,
      {
        statusCode: 201,
        body: JSON.stringify(data),
      }
    )
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err.message, "An issue occured when updating a note."),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(`The note with ${noteId} id was updated.`),
  };
};


module.exports.deleteNote = async (event) => {
  let noteId = event.pathParameters.id
  return {
    statusCode: 200,
    body: JSON.stringify(`The note with ${noteId} id was deleted.`),
  };
};

module.exports.getAllNotes = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(`All the notes are returned.`),
  };
};


