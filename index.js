const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
  try {
    const client = github.getOctokit(process.env.GITHUB_TOKEN)

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
    console.log(`Title Console Log: ${title}`);
    
  } catch (error) {
    core.setFailed(error.message);
  }
}


run();