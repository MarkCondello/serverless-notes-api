const generatePolicy = (principalId, effect, resource) => {
  let authResponse = {}
  authResponse.principalId = principalId

  if (effect && resource) {
    let policyDocument = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": effect,
          "Resource": resource,
          "Action": "execute-api:Invoke",
        }
      ]
    }
    authResponse.authResponse = policyDocument
  }
  // we can pass additional data to the authorizer lambda
  authResponse.context = {
    foo: "Bar",
  }
  console.log(JSON.stringify(authResponse))
  return authResponse
}

exports.handler = (event, context, callback) => {
//check a string value mathes allow, we let the request pass, other wise it is denied
  const token = event.authorizationToken; // "allow" or "deny" value will be set
  switch(token) {
    case "allow":
      callback(null, generatePolicy('user', 'Allow', event.methodArn))
      break
    case "deny":
      callback(null, generatePolicy('user', 'Deny', event.methodArn))
      break
    default:
    callback("Error: Invalid token")
  }
}
/*
  By default serverless will use the token mode if it is not defined in the .yml
*/