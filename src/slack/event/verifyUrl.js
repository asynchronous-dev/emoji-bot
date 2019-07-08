export const verifyUrl = ({ body }) => {
  const parsedBody = typeof body === 'object' ? body : JSON.parse(body);

  console.log('body', body);
  if (parsedBody.type === 'url_verification') {
    return { challenge: parsedBody.challenge };
  }

  return { body: parsedBody };
};
