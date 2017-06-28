# MEDIALIST [![CircleCI](https://circleci.com/gh/Medialist/medialist-app2.svg?style=svg&circle-token=5cb724706595e5ba9e317dab3184ebfe221ba2ac)](https://circleci.com/gh/Medialist/medialist-app2)

Make your PR team smarter and faster with media lists that capture intelligence, cut admin hours and keep campaigns in sync.

## Usage

With `node` `npm` & `meteor` installed

```sh
npm install
npm run watch
```

## Data model

**User**

```js
{
	"_id" : "CBdsCSdGr3X7pLwnJ",
	"createdAt" : ISODate("2017-01-04T16:00:03.904Z"),
	"services" : {
		"twitter" : {
			"id" : "271419228",
			"screenName" : "richsilvo",
			"accessToken" : "ncsoidjjpejfw0e9fjwepifjweifjwefoiwefow",
			"accessTokenSecret" : "sdicnweoifweoinweoinweoviwneoiwneoiwenfow",
			"profile_image_url" : "http://pbs.twimg.com/profile_images/780358752566439936/iP6RPCYM_normal.jpg",
			"profile_image_url_https" : "https://pbs.twimg.com/profile_images/780358752566439936/iP6RPCYM_normal.jpg",
			"lang" : "en"
		},
		"resume" : {
			"loginTokens" : [
				{
					"when" : ISODate("2017-01-04T16:00:03.913Z"),
					"hashedToken" : "osidnsoidvsodivsdoinsndoifjsdofijsjdf="
				}
			]
		}
	},
	"profile" : {
		"name" : "Richard Silverton",
		"avatar": "http://path/to/image.png"
	},
	"myCampaigns": [
		{
			"_id": "eoriwoerijgworigjw409jgw4",
			"name": "The Next Big Thing",
			"slug": "next-big-thing",
			"avatar": "https://example.com/image.png",
			"clientName": "ABC Corp.",
			"updatedAt": ISODate("2017-01-04T15:38:14.882Z")
		}
	],
	"myContacts": [
		{
			"_id": "3rohu349f840fj3049j34g",
			"name": "Andrea Person",
			"slug": "andrea-person",
			"avatar": "https://example.com/avatar.png",
			"updatedAt": ISODate("2017-01-04T15:38:14.882Z")
		}
	]
}
```

**Contact**

```js
{
  "_id" : "22zjKES2iEkN9PTdD",
  "slug" : "SteveRose",
  "name" : "Steve Rose",
  "avatar" : "https://pbs.twimg.com/profile_images/530735370120331264/25YBKDB-_normal.jpeg",
  "outlets" : [
		{ "label": "the Guardian", "value": "Freelance" },
		{ "label": "the Guardian - g2 (supplement)", "value": "Features" }
	],
	"emails" : [
		{ "label" : "Email", "value" : "steverose7@gmail.com" }
	],
	"socials" : [
		{ "label" : "Twitter", "value" : "steverose7", "twitterId" : "109295079" }
	],
	"phones" : [
		{ "label" : "Mobile", "value" : "+44 (0)7980 327 310" }
	],
	"address" : "53 Athenlay Road, London, SE15 3EN, United Kingdom",
	"campaigns" : {
		"campaign-slug-1": {
			"updatedAt" : ISODate("2016-02-26T13:12:53.456Z")
		},
		"campaign-slug-2": {
			"updatedAt" : ISODate("2016-02-26T13:12:53.456Z")
		}
	},
	"tags": [
		{ "_id": "xyz", "slug": "nice", "name": "Nice", "count": 9 }
	],
	"masterLists": [
		{ "_id": "123", "slug": "tech", "name": "Tech" }
	],
	"imports": [
		"contact-import-id"
	]
	"createdAt" : ISODate("2016-02-26T13:12:53.456Z"),
	"createdBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert",
		"avatar" : "https://pbs.twimg.com/profile_images/2592146782/85lbyv6dgv9o3s9b83fw_normal.jpeg"
	},
	"updatedAt" : ISODate("2016-02-26T13:12:53.456Z"),
	"updatedBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert",
		"avatar" : "https://pbs.twimg.com/profile_images/2592146782/85lbyv6dgv9o3s9b83fw_normal.jpeg"
	}
}
```

**Campaigns**

```js
{
	"_id" : "54gbNST2YBuqbrB4T",
  "slug" : "amazonecho",
	"name" : "Amazon Echo",
	"client" : {
		"name" : "Amazon",
		"_id" : "iYurjZ3HbvmMbuRYr"
	},
	"purpose" : "Amazon is good for the UK",
	"contacts" : {
		"EleanorHarding" : "To Contact",
		"SeanWilliams" : "To Contact",
		"NicPaton" : "To Contact",
		"RogerBaird" : "To Contact",
		"GeoffFoster" : "Hot Lead"
	},
	"tags": [
		{ "_id": "xyz", "slug": "nice", "name": "Nice", "count": 9 }
	],
	"masterLists": [
		{ "_id": "123", "slug": "tech", "name": "Tech" }
	],
	"createdAt" : ISODate("2016-02-24T22:26:39.782Z"),
	"createdBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert"
	},
	"updatedAt" : ISODate("2016-09-29T12:30:02.895Z"),
	"updatedBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert"
	}
}
```

**Post**

```js
{
	"_id" : "2EnrcJ7r5i94JTmwZ",
  "type" : "campaigns changed",
	"details" : {
		"action" : "added"
	}
	"message" : "added Eleanor to #activeschools",
	"contacts" : [
		{
			"slug" : "EleanorHarding",
			"name" : "Eleanor Harding",
			"avatar" : "https://pbs.twimg.com/profile_images/674213477477691392/63oxEK6E_normal.jpg"
		}
	],
	"campaigns" : [
		"activeschools"
	],
	"createdBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert",
		"avatar" : "https://pbs.twimg.com/profile_images/2592146782/85lbyv6dgv9o3s9b83fw_normal.jpeg"
	},
	"createdAt" : ISODate("2016-03-08T11:14:22.670Z"),
}
```

**MasterList**

```js
{
  "type": "Contacts",
  "name": "Tech",
  "slug": "tech",
  "items": [
    "contact _id"
  ]
  "order": 0
}
```

**ContactsImport**

```js
{
	"data": [/* ContactCreateSchema valid objects */]
	"results": {
		created: ["contact-id"],
		updated: ["contact-id"],
		failed: [/* ContactCreateSchema valid objects */]
	}
	"createdBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert",
		"avatar" : "https://pbs.twimg.com/profile_images/2592146782/85lbyv6dgv9o3s9b83fw_normal.jpeg"
	},
	"createdAt" : ISODate("2016-03-08T11:14:22.670Z"),
}
```

### Use real data when developing

Get access to the Mongo Atlas account, or ask a friend for a recent DB snapshot.

In the web ui, choose
- "Backup"
- <cluster you want>
- "Restore or Download"
- "Backup"
- Provide your password
- Download file

Now untar the downloaded file. The dir you are left with isn't a mongodump as you might have been hoping for. It's a snapshop of the db data file, and it's intended for use in a replicaSet, so we've gotta get our local mongo to point at this `dbpath` at startup, and get it to behave like a single node replicaSet, like so:

```sh
mongod --dbpath <backup dir path here> --replSet ml

# in another shell
mongo
# MongoDB shell version v3.4.4
# connecting to: mongodb://127.0.0.1:27017
# MongoDB server version: 3.4.4
# blah blah blah

# Let this mongo knoe it's the primary.
> rs.initiate({_id: "ml", members: [{_id: 0, host: 'localhost:27017'}]})
ml:SECONDARY>
# wait a couple of seconds, while mongo holds an eleection for 1
ml:PRIMARY> exit
```

The replicaSet name can be anything you like, just use the same one in both steps.

Now your local mongo is running on a snapshot of the cluster db, with all that good data. Don't share it with other people, it's got real humans contact detail in. If it doesn't work, consult the docs: [restore-replica-set-from-backup]

Start your meteor app with the MONGO_URL var

```sh
MONGO_URL=mongodb://localhost/next npm run watch
```

## Styling

Some [Basscss] plus custom atoms with [postcss] to build it. See `client/main.css`

### Colours

![Charcoal](https://swatches-lkzftbccpg.now.sh/?color=%2324364C)
![Royal blue](https://swatches-lkzftbccpg.now.sh/?color=%232B60D5)
![Ultramarine blue](https://swatches-lkzftbccpg.now.sh/?color=%23437AF4)
![Bleu de France](https://swatches-lkzftbccpg.now.sh/?color=%234299FF)

### Font sizes

We've got loads of font sizes, and they don't follow a typescale, so `f-xxxl` through `f-xxxxs` is used to denote font size. Most of the site is `f-md`, `f-sm` and `f-lg`, while the more extreme sizes occur infrequently so this feel like the most natural way to model it.

```css
.f-xxxl { font-size:25px }
.f-xxl { font-size:20px }
.f-xl { font-size:18px }
.f-lg { font-size:16px }
.f-md { font-size:15px }
.f-sm { font-size:14px }
.f-xs { font-size:13px }
.f-xxs { font-size:12px }
.f-xxxs { font-size:11px }
.f-xxxxs { font-size: 9px }
```

### Spacing

- `m` for margin. `m1` is `margin: 1rem`
- `p` for padding. `p3` is `padding: 3rem`
- `x` for left/right. `mx2` is `margin-left: 2rem; margin-right: 2rem;`
- `y` for top/bottom. `py3` is `padding-top: 3rem padding-bottom: 3rem;`
- `l` is left, `r` is right. `pl1` is `padding-left: 1rem;`
- `t` is top, `b` is bottom. `mt1` is `margin-top: 1rem;`
- `1` is 1rem `2` is 2rem `3` is 3rem, `4` is 4rem, `0` is none.

So:

```html
<div class='mb3 p2'>Woo woo</div>
```

- `mb3`: margin bottom 3
- `p2`: margin all 2

You can have responsive padding and margins too using [basscss-responsive-padding] & [basscss-responsive-margin]

```html
<div class='mx3 p1 sm-p2 md-px3'>Woo woo</div>
```

- `mx3`: margin left/right 3
- `p1`: padding all sides 1
- `sm-p2`: On small screens and up, padding all sides 2
- `sm-px3`: On medium screens and up, padding left/right 3

Due to inheritance/media queries the net padding applied on a large screen would be `padding:3rem 2rem`

### Media queries

Using [postcss-custom-media]

Using this `input.css`:

```css
@custom-media --breakpoint-sm (min-width: 40em);

@media (--breakpoint-sm) {
  /* styles for small (tablet) viewport or larger */
}
```

you will get:

```css
@media (max-width: 40em) {
  /* styles for small viewport */
}
```

## Tests

### Integration

There is a browser test suite built using [nightwatch](http://nightwatchjs.org/).

To start the app, run the tests and then shut down the app run:

```sh
npm run test:browser
```

To run the tests without starting and stopping the app automatically, first start the app with the test configuration:

```sh
npm run watch:server:test
```

Then run the tests as usual:

```sh
npm run test:browser
```

#### Options

Test options are specified as environment variables.

```
BROWSER 'chrome' or 'firefox'
PARALLEL true or false
```

You will need a recent version of chrome or firefox installed.

#### Running individual integration tests

To specify a subset of tests to run, [tag your tests](http://nightwatchjs.org/guide#test-tags) and pass the tags to the test runner.  For example to run tests with the `contacts` tag:

```sh
npm run test:browser -- --tag contacts
```

More generally anything after `--` will be passed to the nightwatch executable.

[Basscss]: http://www.basscss.com/
[postcss]: http://postcss.org/
[postcss-custom-media]: https://github.com/postcss/postcss-custom-media
[basscss-responsive-padding]: https://github.com/basscss/addons/tree/master/modules/responsive-padding
[basscss-responsive-margin]: https://github.com/basscss/addons/tree/master/modules/responsive-margin
[restore-replica-set-from-backup]: https://docs.mongodb.com/manual/tutorial/restore-replica-set-from-backup/#restore-database-into-a-single-node-replica-set
