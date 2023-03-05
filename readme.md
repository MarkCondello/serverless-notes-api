## Setup
- npm install -g serverless@2
- nvm use 14.16

## Credentials for connecting AWS + serverless
https://www.serverless.com/framework/docs/providers/aws/cli-reference/config-credentials
serverless config credentials --provider aws --key <API_KEY> --secret <API_SECRET_KEY> --profile <PROFILE_NAME>