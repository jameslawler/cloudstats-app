# cloudstats-app

A simple statistics application to track actions (page views, events) that can be deployed as a Cloudflare worker. This project uses a Cloudflare D1 instance to store the statistics.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jameslawler/cloudstats-app)

## Getting Started

Use the button above to deploy a copy of this project into your Cloudflare account.

1. Configure the `SITE_IDS` environment variable. This needs to contain a list of domains that you will be tracking. For example: `['mydomain.com', 'myotherdomain.com]`.
2. Add a custom domain to the worker project so that it runs on the same domain as the site you want to track.
3. Import the web component in the HTML head of the pages you want to track.

```html
<script type="module" src="https://hits.mydomain.com/js/cloudstats.webcomponent.js"></script>
```

4. Add the web component to the pages you want to track. Pass the `action` attribute to configure the action name for that tracking event. This action value will automatically be set to the current url (without query parameters). If no `action` parameter is passed, then a domain level tracking is done, so track overall visits to the domain.

```html
<cloud-stats action="page_load"></cloud-stats>
```

## Schema

The storage schema is intentionally kept simple but extensible. All statistics are kept in one table with the following schema.

| Field         | Description                                     |
| ------------- | ----------------------------------------------- |
| id            | Auto generated UUID                             |
| siteId        | Site Identifier that this statistic belongs too |
| type          | Type of statistics (visit, event)               |
| actionName    | Name of the action (eg. page_view, download)    |
| actionValue   | Value of the action (eg. page url, file url)    |
| overallCounts | JSON object containing count statistics         |
| countryCounts | JSON object containing count statistics         |
| refererCounts | JSON object containing count statistics         |
| createdAt     | Created date                                    |
| updatedAt     | Updated date                                    |

## Counts

For each action name and value three types of counts are tracked.

1. `Overall Counts` - this JSON formatted value contains total counts. Total counts are for total lifetime, and by year / month.

```json
{
	"total": 2,
	"years": {
		"2026": {
			"months": {
				"mar": 2
			}
		}
	}
}
```

2. `Country Counts` - this JSON formatted value contains counts by country code. The country code is determined by Cloudflare and is taken from the `cf-ipcountry` header value. Total counts are for total lifetime, and by year / month.

```json
{
	"pt": {
		"total": 1,
		"years": {
			"2026": {
				"months": {
					"mar": 1
				}
			}
		}
	},
	"au": {
		"total": 1,
		"years": {
			"2026": {
				"months": {
					"mar": 1
				}
			}
		}
	}
}
```

3. `Referer Counts` - this JSON formatted value contains counts by referer domain. The refer is provided by the web component. Only the domain part of the referer is used. Total counts are for total lifetime, and by year / month.

```json
{
	"www_google_com": {
		"total": 2,
		"years": {
			"2026": {
				"months": {
					"mar": 2
				}
			}
		}
	}
}
```
