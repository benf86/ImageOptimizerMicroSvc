Usage is simple. Create a config.json file in the root dir, e.g.:

```json
{
  "token": "238c3bd9-1fdf-45db-bb67-2c848ccfcbbf",
  "port": "9999"
}
```

or set the `IMGOPTIMIZERTOKEN` and `IMGOPTIMIZERPORT` environment variables and execute `node index.js`.

You can then get an optimized image either by hitting `/optimize` with `token` and `image` query variables like

```curl
curl -X GET \
  'http://localhost:3000/optimize?image=https%3A%2F%2Fwww.nationalparkstraveler.org%2Fsites%2Fdefault%2Ffiles%2Flegacy_files%2Fuserhead%2Fpicture-56.jpg&token=208c39d9-1fdf-45db-b667-2c888ccfcbbf'
  ```

or do a multipart upload to `/optimize` like

```curl
curl -X POST \
  'http://localhost:8892/optimize?token=208c39d9-1fdf-45db-b667-2c888ccfcbbf' \
  -H 'cache-control: no-cache' \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -F image=@randomimage.png
```



Licensed under `Creative Commons Attribution Non Commercial Share Alike 4.0`