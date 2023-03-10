# Random warp bg fetcher

Get a new warp background every day!

Add to your starup file (e.g. `.zshrc`):

```bash

npx get-warp-bg

```

Switch your active theme in the warp settings to "Random Bg".

Feel free to edit the opacity and anything else in `~/.warp/themes/random_bg/random_bg.yaml`

## What does it do?

1. Creates a `random_bg` theme in your `~/.warp/themes/` if not already there
2. Checks if you already got a new image today, limiting to 1 per day (use
   `--force` to override)
3. Scrapes a random image from "https://deepdreamgenerator.com/"
4. Sets that image as the background for the "Random Bg" theme

## Options

```
--force    Forces fetching a new random image. Normally this is limited to one per
           day.
```
