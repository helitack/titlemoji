const core = require('@actions/core');
const github = require('@actions/github');
const conventionalCommitsConfig = require('conventional-changelog-conventionalcommits');
const parser = require('conventional-commits-parser').sync;


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

    const title = pullRequest.title;
    core.info(`Pull Request title: "${title}"`);

    const { parserOpts } = await conventionalCommitsConfig();
    const parserResult = parser(title, parserOpts);

    if (!parserResult.type) {
      core.info(`No conventional commits type found in title: "${title}"`);
      return;
    }

    let emoji = '';
    switch(parserResult.type) {
      case 'feat':
        emoji = ':sparkles:';
        break;
      case 'fix':
        emoji = ':bug:';
        break;
      case 'docs':
        emoji = ':books:';
        break;
      case 'style':
        emoji = ':art:';
        break;
      case 'refactor':
        emoji = ':recycle:';
        break;
      case 'perf':
        emoji = ':zap:';
        break;
      case 'test':
        emoji = ':fire:';
        break;
      case 'chore':
        emoji = ':construction:';
        break;
      case 'revert':
        emoji = ':rewind:';
        break;
      default:
        emoji = ':question:';
    }

    core.info(`Conventional commits type: "${parserResult.type}"`);
    core.info(`Setting emoji to: "${emoji}"`);
    
  } catch (error) {
    core.setFailed(error.message);
  }
}


run();