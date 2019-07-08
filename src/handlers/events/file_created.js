import React from 'react';
import request from 'request';
import fs from 'fs';
import {
  SlackRenderer,
  Message,
  MarkdownText,
  SectionBlock,
} from 'react-chat-renderer';
const { WebClient } = require('@slack/web-api');

// An access token (from the slack web ui - xoxs)
const slackToken = process.env.SLACK_BOT_TOKEN;

const slack = new WebClient(slackToken);

// private download url, use bearer token
const downloadEmoji = uri => {
  return {
    url: uri,
    headers: {
      Authorization: `Bearer ${slackToken}`,
    },
  };
};

var saveEmoji = async function(uri, filename, callback) {
  request
    .get(downloadEmoji(uri))
    .on('response', function(response) {
      console.log(response.statusCode);
      console.log(response.headers['content-type']);
    })
    .pipe(fs.createWriteStream(filename))
    .on('close', callback);
};

export default async event => {
  console.log('file-created-event', event);

  const fileInfo = await slack.files.info({ file: event.file_id });

  const downloadUrl = fileInfo.file.url_private_download;
  const fileName = fileInfo.file.name;

  saveEmoji(downloadUrl, fileName, function() {
    // add emoji to slack
    slack.apiCall('emoji.add', {
      name: fileName.split('.')[0],
      mode: 'data',
      image: fs.createReadStream(fileName),
    });

    // delete downloaded copy
    fs.unlink(fileName, err => {
      if (err) {
        console.error(err);
      }
    });
  });

  const message = SlackRenderer.render(
    <Message token={slackToken} channel={event.user_id}>
      <SectionBlock>
        <MarkdownText>{`hi! just added :${
          fileName.split('.')[0]
        }: for you`}</MarkdownText>
      </SectionBlock>
    </Message>
  );

  // See: https://api.slack.com/methods/chat.postMessage
  const response = await slack.chat.postMessage(message);
  console.log(response);
};
