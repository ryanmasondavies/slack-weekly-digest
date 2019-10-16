# Slack weekly digest

This app is intended to run on Heroku for posting articles and talks to a Slack channel on a regular basis.

## How to use

The app integrates with Pocket for retrieving links to articles and talks.

It requires some environment variables to be set:

- `POCKET_CONSUMER_KEY`: this is retrieved from Pocket by [creating a new application](https://getpocket.com/developer/).
- `POCKET_ACCESS_TOKEN`: this is retrieved by following the OAuth authentication process, and is used for `/api/publish`, which is intended to run on a schedule.
- `SLACK_ENDPOINT`: again only used by `/api/publish`, for sending the digest to a particular Slack channel.

`GET /`
---

This is mostly just used as an OAuth redirect location.

`GET /oauth/redirect`
---

Use this to authenticate a new Pocket account. It redirects via Pocket to `/oauth/finish` and then to `/`, where the access token will be visible.

`GET /oauth/finish`
---

Used as a redirect as part of the OAuth process.

`GET /api/digest?access_token={access_token}`
---

Pass in the access token you got from OAuth authentication.

Generates a list of 3 articles and 3 talks by reading them from the Pocket API. It retrieves 3 random articles that are tagged with `digest`, and 3 random talks that are tagged with `talk`, and assembles them into a text body that's formatted for sending to Slack:


```
*Talks:*

- Title: URL
- Title: URL
- Title: URL

*Articles:*

- Title: URL
- Title: URL
- Title: URL
```

`GET /api/publish`
---

Designed to be triggered on a schedule. I personally use the Heroku Scheduler for this. This uses the same summary that's created by `/api/digest` and sends it to a Slack webhook.
