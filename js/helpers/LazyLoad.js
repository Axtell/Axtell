import Data from '~/models/Data';

const LazyLoad = {
    script(url) {
        return () => new Promise((resolve, reject) => {
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.async = true;
            scriptElement.src = url;

            scriptElement.addEventListener('load', () => {
                resolve();
            });

            scriptElement.addEventListener('error', (errorEvent) => {
                reject(errorEvent);
            });

            document.body.appendChild(scriptElement);
        });
    },

    once(asyncFn, first = (value) => value) {
        let _inProgress = null;
        let _value = null;

        function tap(resolve) {
            return async (value) => {
                _value = await first(value);
                resolve(_value);
                return _value;
            }
        }

        return () => new Promise((resolve, reject) => {
            if (_value) {
                resolve(_value);
            } else if (_inProgress) {
                _inProgress.then(resolve);
                _inProgress.catch(reject);
            } else {
                _inProgress = asyncFn()
                    .catch(reject)
                    .then(tap(resolve));
            }
        });
    }
};

export default LazyLoad;
export const LazySE = LazyLoad.once(
    LazyLoad.script(`https://api.stackexchange.com/js/2.0/all.js`),
    () => new Promise((resolve, reject) => {
        const SE = window.SE

        SE.init({
            clientId: Data.shared.envValueForKey('SE_CLIENT_ID'),
            key: Data.shared.envValueForKey('SE_KEY'),
            channelUrl: `${location.protocol}//${location.host}/static/proxy.html`,
            complete: ({version}) => {
                SE.authenticate({
                    success: (data) => {
                        window.SEdata = data;
                        console.log(data);
                    },
                    error: (data) => {
                        window.SEerr = data;
                        console.log(data);
                    },
                    scope: ['read_inbox'],
                    networkUsers: true
                })
            }
        });

        return SE;
    })
);
