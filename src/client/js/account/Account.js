const getApi = new Promise(function(resolve, reject) {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', 'http://connect.facebook.net/en_US/all.js');
    document.body.appendChild(script);

    script.addEventListener('load', function() {
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        window.fbAsyncInit = function() {
            FB.init({
                appId      : '579260708936044',
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true,
                version    : 'v2.8'
            });

            resolve(FB);
        };

    });
});

export default {
    getAuthToken: function() {
        return getApi.then(function(FB) {
            return new Promise(function(resolve, reject) {
                FB.getLoginStatus(function({status, authResponse}) {
                    if(status === 'connected') {
                        resolve(authResponse.accessToken);
                    } else if(status === 'not_authorized') {
                        FB.login(function({status, authResponse}){
                            if(status === 'connected') {
                                resolve(authResponse.accessToken);
                            } else {
                                reject(status);
                            }
                        });
                    } else {
                        reject(status);
                    }
                });
            })
        })
    }
};