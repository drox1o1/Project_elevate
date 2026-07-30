# Pop PPP key art

Drop index images in this directory. Next serves `public/` and nothing else, so
an image anywhere under `components/` or `lib/` is never reachable by URL.

Naming: either the index slug (`sanju-baba-50-tola.jpg`) or one of the aliases
in `lib/pop-ppp/images.ts` (`sanjubaba.jpg`, `raju ki mummy.jpg`,
`quarterpoundcheese.jpeg`, `5dollarshake.jpeg`, `meth.jpeg`, `moneyball.jpg`).
Case, spaces, dashes and underscores are all ignored when matching.

To bring images across from another folder and rename them to their slugs:

```bash
npm run pop-ppp:images                 # reads components/pop-ppp
npm run pop-ppp:images -- path/to/dir  # or anywhere else
```

Accepted extensions, in preference order: `.webp` `.avif` `.jpg` `.jpeg` `.png`.

Any index without a file here falls back to generative artwork drawn from its
own price series, so the section is complete with or without images. Images are
used on index cards, the cold open, the rail thumbnails and the share export.

Suggested source images: at least 1200px on the short edge, square or landscape.
The card crops to 16:10, the cold open to a square, the share export to a square.
