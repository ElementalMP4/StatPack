# StatPack

A very simple API for keeping count of page views built using Node.JS and SQLite3

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

Every time a statpack URL is requested, the count will increment.

### Example URLs:

This produces an image for the stat `page_counter` with a red colour band.
```
http://localhost:3000/stat?name=page_counter&mode=image&colour=FF0000
```

This produces a number for the stat `page_counter_mark_two`
```
http://localhost:3000/stat?name=page_counter_mark_2&mode=text
```

To add StatPack to a markdown or HTML file, use something like this:
```
<p style="text-align: center;"><img src="http://your-statpack-server.com/stat?name=elementalmp4-github&colour=ffa500" alt="elementalmp4's page views" /></p>
```

NOTE: All requests MUST go to `/stat`

## Managing StatPack

StatPack has a very simple and intuitive console which allows you to quickly manipulate data without the need of an SQLite browser.