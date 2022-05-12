# StatPack

A very simple API for keeping count of page views

## Running StatPack

1) Pull this repository
2) run `npm install` to install the dependencies
3) Create a `config.json` file with the following properties:

```json
{
    "port": 3000,
    "remote_create": true
}
```

`port` must be an integer. It is the port the webserver runs on.
`remote_create` is a boolean. It allows/disallows the automatic creation of stats via the API.

## Implementing StatPack

StatPack has two result options: `text` and `image`. The default is `image`.

StatPack requires a `name` parameter so it knows which stat to increment.

If `image` is being used, a custom colour can be chosen by specifying a hex colour via `colour`. This parameter should not have a #.

### Example URLs:

This produces an image for the stat `page_counter` with a red colour band.
```
http://localhost:3000/stat?name=page_counter&mode=image&colour=FF0000
```

This produces a number for the stat `page_counter_mark_two`
```
http://localhost:3000/stat?name=page_counter_mark_2&mode=text
```

NOTE: All requests MUST go to `/stat`
