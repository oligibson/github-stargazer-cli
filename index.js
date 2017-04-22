#!/usr/bin/env node
const fs = require('fs');
const request = require('request-promise');
const csvWriter = require('csv-write-stream');
const github = require('./github.creds.json');
const writer = csvWriter();

const headers = {
    'User-Agent': github.user,
    'Authorization': `token ${github.token}`
}

const parse_link_header = header => {
    if (header.length === 0) {
        throw new Error("input must not be of zero length");
    }
    // Split parts by comma
    const parts = header.split(',');
    let links = {};
    // Parse each part into a named link
    for(let i=0; i<parts.length; i++) {
        const section = parts[i].split(';');
        if (section.length !== 2) {
            throw new Error("section could not be split on ';'");
        }
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
    }
    return links;
}

const fetchStars = (user, repo) => {
	console.log('Fetching Stars');
	let count = 0;
  	const options = {
  		headers: headers,
	    url: `https://api.github.com/repos/${user}/${repo}/stargazers`,
	    transform: function (body, response, resolveWithFullResponse) {
	    	const links = parse_link_header(response.headers.link);
	        return Object.assign(body, links);
	    },
	    json: true
  	};

  const goFetch = users => {
  	count++;
  	console.log(`Fetching Page ${count}`);
    return request(options).then(function(data) {
		data.forEach(user => users.push(user));
		if(data.next) {
			options.url = data.next;
		return goFetch(users);
		} else {
			return users;
		}
    });
  }

  return goFetch([]);
};

const fetchUsers = users => {
	console.log(`Processing ${users.length} users`);

	const goFetch = user => {
		console.log(`Getting ${user.login}`);
		const options = {
			url: user.url,
			headers: headers,
		    json: true
		};
		return request(options).then(user => {
			if(user.email && user.email.length > 0){
				writer.write(user);
				return user;
			}else{
				return;
			}
		});
	}

	const actions = users.map(goFetch);

	const results = Promise.all(actions);

	return results;
}

const user = process.argv[process.argv.length - 2];
const repo = process.argv[process.argv.length - 1];
writer.pipe(fs.createWriteStream(`./${repo}-users.csv`));

fetchStars(user, repo)
	.then(fetchUsers)
	.then((users) => {
		writer.end();
		console.log('File Write Complete');
	})
	.catch((err) => {
		console.log('Error', err);
	});