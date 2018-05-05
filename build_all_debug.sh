npx parcel watch scss/entry-light.scss -d static/css -o all-light.css --no-hmr &
npx parcel watch scss/entry-dark.scss -d static/css -o all-dark.css --no-hmr &
NODE_ENV=debug npx webpack -w
