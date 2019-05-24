This language was inspired and most likely influenced by [jq](https://stedolan.github.io/jq/). Out of curiosity, I was wondering if I could recreate the [jq Tutorial](https://stedolan.github.io/jq/tutorial/) in `dt`. So, here it is

# Get Some Data

The `jq` tutorial redirects `curl` output to `jq`. `dt` works the same, but I'm going to redirect the `curl` output to a temporary file and use that file instead.

```bash
curl 'https://api.github.com/repos/stedolan/jq/commits?per_page=5' > temp.json
```

# Show Data

```bash
cat temp.json
```

# Pass DAta Through Untouched

```bash
cat temp.json | dt '$'
```

# Extract first commit

```bash
cat temp.json | dt '$.0'
```

# Extract message and name from first element

```bash
cat temp.json | dt '{ message: $.0.commit.message, name: $.0.commit.committer.name }'
```

# Extract message and name from all elements

```bash
cat temp.json | dt 'map($, { message: $.commit.message, name: $.commit.committer.name })'
```

# Get parents

```bash
cat temp.json | dt 'map($, { message: $.commit.message, name: $.commit.committer.name, parents: map($.parents, $.html_url) })'
```
