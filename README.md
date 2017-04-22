# GitHub Stargazer CLI

A very simple JavaScript utility that queries the GitHub API to get all the users who starred a repository and write their details to a CSV file.

The utility will filter out all users who don't have an email address registered with GitHub.

## Getting Started

### Prerequisites

- [GitHub Personal API Token](https://github.com/blog/1509-personal-api-tokens)
- [Node.js and npm](nodejs.org) Node ^6.0.0, npm ^3.0.0

### Usage

1. git clone `git clone `

2. Run `npm install`

3. Create a file in the root of the project called `github.creds.json`, this should contain your GitHub username and personal token eg:

	```
	{
		"user": "name",
  		"token": "12345"
	}
	```
4. Run `node index.js user repo` where repo is the repository whos stars you want to scrape and user is the owner of the repo.

5. GitHub Stargazer will write a `.csv` file to the root of the project containing all the users who stared the project and have an email address linked to their GitHub account.
