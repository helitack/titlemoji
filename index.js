const core = require('@actions/core');
const github = require('@actions/github');
const conventionalCommitsConfig = require('conventional-changelog-conventionalcommits');
const parser = require('conventional-commits-parser').sync;
const config = require('./config.js');
const emojiList = require('./emoji.js');


async function run() {
  try {
    const client = github.getOctokit(process.env.GITHUB_TOKEN);
    
    const contextPullRequest = github.context.payload.pull_request;
    if (!contextPullRequest) {
      throw new Error(
        "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred."
      );
    }

    const owner = contextPullRequest.base.user.login;
    const repo = contextPullRequest.base.repo.name;

    const {data: pullRequest} = await client.pulls.get({
      owner,
      repo,
      pull_number: contextPullRequest.number
    });

    const originalTitle = pullRequest.title;

    const { parserOpts } = await conventionalCommitsConfig();
    const parserResult = parser(originalTitle, parserOpts);

    if (!parserResult.type) {
      core.info(`No conventional commits type found in title: "${originalTitle}"`);
      return;
    }

    const emojiMapping = config.emojiNameMappings.find(m => m.type === parserResult.type);

    if (!emojiMapping) {
      core.info(`No Mapping was found for the commit type: "${parserResult.type}"`);
      return;
    }

    const emojiObject = emojiList.gitmojis.find(e => e.name === emojiMapping.emojiName);
    const emoji = emojiObject.emoji;

    if (!emoji) {
      core.info(`Could not map an emoji to the following commit type: "${parserResult.type}"`);
      return;
    }

    if (originalTitle.includes(emoji)) {
      core.info(`Title already includes the ${emoji} emoji: "${originalTitle}"`);
      return;
    }

    let newTitle = null;
    if(emoji) {
      const originalTitleArray = originalTitle.split(':');
      const originalTitleType = originalTitleArray[0];
      const originalTitleWithoutType = originalTitleArray.slice(1).join(':');
      newTitle = `${originalTitleType}: ${emoji}${originalTitleWithoutType}`;
    }

    if (newTitle) {
      await client.pulls.update({
        owner,
        repo,
        pull_number: contextPullRequest.number,
        title: newTitle,
      });
      core.info(`Successfully added an emoji to the title!: "${newTitle}"`);
    }
    
  } catch (error) {
    core.setFailed(error.message);
  }
}


run();