const core = require('@actions/core');
const github = require('@actions/github');


async function run() {
  try {
    const authToken = core.getInput('github_token', {required: true});

    const client = new github.GitHub(authToken);

    const {data: pullRequest} = await client.pulls.get({
      owner,
      repo,
      pull_number: github.context.payload.pull_request.number
    });

    const title = pullRequest.title;

    core.info(`Pull Request title: "${title}"`);
    console.log(`Title Console Log: ${title}`);
    
  } catch (error) {
    core.setFailed(error.message);
  }
}


run();