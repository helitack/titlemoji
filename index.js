const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
  try {
    console.log(`GITHUB_TOKEN ${process.env.GITHUB_TOKEN}`);
    
    const client = github.getOctokit(process.env.GITHUB_TOKEN);
    
    console.log(`client ${client}`);

    const contextPullRequest = github.context.payload.pull_request;
    if (!contextPullRequest) {
      throw new Error(
        "This action can only be invoked in `pull_request_target` or `pull_request` events. Otherwise the pull request can't be inferred."
      );
    }

    console.log(`contextPullRequest ${contextPullRequest}`);
    
    const owner = contextPullRequest.base.user.login;
    const repo = contextPullRequest.base.repo.name;

    console.log(`owner ${owner}`);
    console.log(`repo ${repo}`);
    console.log(`number ${contextPullRequest.number}`);

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