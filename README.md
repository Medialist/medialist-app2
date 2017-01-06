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
		"name" : "Richard Silverton"
	},
	"myMedialists": [
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
  "sectors" : "Entertainment (Cinema, Film & DVD), Home Interest (Architecture), Arts",
  "bio" : "I'm a freelance writer, mainly on cinema and architecture. I often write for the Guardian: http://t.co/xgjs5FoFLn"
  "languages" : "English",
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
	"importedData" : [
		{
			"data" : { "columns" : [], "row" : [] },
			"importedAt" : ISODate("2016-02-26T13:12:53.455Z")
		}
	],
	"medialists" : [
		"medialistSlug"
	],
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
	},
	"masterLists": [
		{ "_id": "123", "slug": "tech", "name": "Tech" }
	],
}
```

**Medialist**

```js
{
	"_id" : "54gbNST2YBuqbrB4T",
	"name" : "dailymailjournos",
	"client" : {
		"name" : "Amazon",
		"_id" : "iYurjZ3HbvmMbuRYr"
	},
	"purpose" : "Amazon is good for the UK",
	"topics" : [ ],
	"contacts" : {
		"EleanorHarding" : "To Contact",
		"SeanWilliams" : "To Contact",
		"NicPaton" : "To Contact",
		"RogerBaird" : "To Contact",
		"GeoffFoster" : "Hot Lead"
	},
	"createdAt" : ISODate("2016-02-24T22:26:39.782Z"),
	"createdBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert"
	},
	"updatedAt" : ISODate("2016-09-29T12:30:02.895Z"),
	"updatedBy" : {
		"_id" : "hNc2ArK9TcAWyEXqQ",
		"name" : "Olly Gilbert"
	},
	"slug" : "dailymailjournos",
	"masterLists": [
		{ "_id": "123", "slug": "tech", "name": "Tech" }
	],
}
```

**Post**

```js
{
	"_id" : "2EnrcJ7r5i94JTmwZ",
  "type" : "medialists changed",
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
	"medialists" : [
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


[Basscss]: http://www.basscss.com/
[postcss]: http://postcss.org/
[postcss-custom-media]: https://github.com/postcss/postcss-custom-media
[basscss-responsive-padding]: https://github.com/basscss/addons/tree/master/modules/responsive-padding
[basscss-responsive-margin]: https://github.com/basscss/addons/tree/master/modules/responsive-margin
