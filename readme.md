# Random warp bg fetcher

Scrapes the latest deep dream image and downloads it into your warp theme
directory.

Be sure to have a custom theme at `~/.warp/themes/[theme]`

This will output `deep.jpg` so you'll want your theme to have:

```
background_image:
  path: [theme]/deep.jpg
  opacity: 20
```

## Example Usage

### NOTE!

You do need to visit `https://deepdreamgenerator.com/` before running this
script.

```bash
# downloads to ~/.warp/themes/night_owl/deep.jpg
node index.js night_owl
```

More about my setup and custom "Dank Owl" theme:
https://dev.to/danieluhl/dank-owl-custom-themes-in-warp-terminal-and-neovim-4a24
