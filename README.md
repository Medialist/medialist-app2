# MEDIALIST

Make your PR team smarter and faster with media lists that capture intelligence, cut admin hours and keep campaigns in sync.

## Usage

With `node` `npm` & `meteor` installed

```sh
npm install
npm run watch
```

## Styling

[Basscss] plus custom atoms with [postcss] to build it. See `client/main.css`

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

[postcss-custom-media]: https://github.com/postcss/postcss-custom-media
[basscss-responsive-padding]: https://github.com/basscss/addons/tree/master/modules/responsive-padding
[basscss-responsive-margin]: https://github.com/basscss/addons/tree/master/modules/responsive-margin
