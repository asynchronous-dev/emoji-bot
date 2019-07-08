import { verifyUrl } from './verifyUrl';
import * as handlers from '../../handlers';

export const event = async event => {
  // TODO: verify payload using signing secret
  // https://api.slack.com/docs/verifying-requests-from-slack

  console.log(event);

  const challengeResponse = verifyUrl(event);
  if (challengeResponse.challenge) {
    return {
      statusCode: 200,
      body: JSON.stringify(challengeResponse),
    };
  }

  const { body } = challengeResponse;

  const handler = handlers.events[body.event.type];

  try {
    await handler(body.event);
  } catch (e) {
    console.log('error', e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
